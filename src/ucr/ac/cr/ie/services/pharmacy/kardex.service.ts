import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
    MedicationAdministration,
    MedicationPrescription,
    AdministrationStatus,
    PrescriptionStatus,
} from '../../domain/pharmacy';
import { OlderAdult } from '../../domain/virtual-records/older-adult.entity';
import { RecordAdministrationDto, KardexQueryDto } from '../../dto/pharmacy';
import { getTenantContext } from '../../common/tenant/tenant-context';

const COSTA_RICA_TIME_ZONE = 'America/Costa_Rica';
const COSTA_RICA_UTC_OFFSET_MINUTES = -6 * 60;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
type KardexStatus = AdministrationStatus | 'suspended_absence';

export interface ProjectedMedicationAdministration {
    id: null;
    idPrescription: number;
    idOlderAdult: number;
    scheduledTime: Date;
    administeredTime: null;
    status: 'scheduled' | 'suspended_absence';
    doseGiven: string;
    prescription: MedicationPrescription;
    olderAdult?: OlderAdult;
    projected: true;
    projectedKey: string;
}

@Injectable()
export class KardexService {
    constructor(
        @Inject('MedicationAdministrationRepository')
        private readonly adminRepo: Repository<MedicationAdministration>,
        @Inject('MedicationPrescriptionRepository')
        private readonly prescriptionRepo: Repository<MedicationPrescription>,
    ) {}

    async getDailyKardex(query: KardexQueryDto): Promise<{
        message: string;
        data: Array<MedicationAdministration | ProjectedMedicationAdministration>;
    }> {
        const targetDate = query.date ?? this.currentCostaRicaDate();
        this.assertDateOnly(targetDate);
        const dayStart = this.costaRicaDateTime(targetDate, '00:00');
        const nextDay = this.addDays(targetDate, 1);
        const dayEnd = new Date(this.costaRicaDateTime(nextDay, '00:00').getTime() - 1);

        const actualQuery = this.adminRepo.createQueryBuilder('admin')
            .leftJoinAndSelect('admin.prescription', 'presc')
            .leftJoinAndSelect('presc.medication', 'med')
            .leftJoinAndSelect('admin.olderAdult', 'patient')
            .leftJoinAndSelect('admin.administrator', 'staff')
            .where('admin.scheduled_time BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd });
        if (query.olderAdultId) {
            actualQuery.andWhere('admin.id_older_adult = :oaId', { oaId: query.olderAdultId });
        }
        if (query.status && query.status !== 'suspended_absence') {
            actualQuery.andWhere('admin.status = :status', { status: query.status });
        }
        const actual = await actualQuery.orderBy('admin.scheduled_time', 'ASC').getMany();
        for (const administration of actual) {
            // A legacy row with a real administration timestamp remains an event even if its old status was wrong.
            if (administration.status === AdministrationStatus.SCHEDULED && administration.administeredTime) {
                administration.status = AdministrationStatus.ADMINISTERED;
            }
        }

        if (query.status && !['scheduled', 'suspended_absence'].includes(query.status)) {
            return { message: `Kardex retrieved successfully for ${targetDate}`, data: actual };
        }

        const prescriptionsQuery = this.prescriptionRepo.createQueryBuilder('presc')
            .leftJoinAndSelect('presc.medication', 'med')
            .leftJoinAndSelect('presc.olderAdult', 'patient')
            .where('presc.status = :status', { status: PrescriptionStatus.ACTIVE })
            .andWhere('presc.start_date <= :date', { date: targetDate })
            .andWhere('(presc.end_date IS NULL OR presc.end_date >= :date)', { date: targetDate })
            .andWhere('presc.is_prn = FALSE');
        if (query.olderAdultId) {
            prescriptionsQuery.andWhere('presc.id_older_adult = :oaId', { oaId: query.olderAdultId });
        }
        const prescriptions = await prescriptionsQuery.getMany();
        const absenceByResident = await this.residentsOnTemporaryAbsence(
            [...new Set(prescriptions.map((prescription) => prescription.idOlderAdult))],
        );
        const actualSlots = new Set(actual.map((entry) => this.slotKey(entry.idPrescription, entry.scheduledTime)));
        const projected: ProjectedMedicationAdministration[] = [];

        for (const prescription of prescriptions) {
            for (const scheduledTime of this.projectSchedule(prescription, targetDate)) {
                const key = this.slotKey(prescription.id, scheduledTime);
                if (actualSlots.has(key)) continue;
                const status = absenceByResident.has(prescription.idOlderAdult)
                    ? 'suspended_absence'
                    : 'scheduled';
                if (query.status && status !== query.status) continue;
                projected.push({
                    id: null,
                    idPrescription: prescription.id,
                    idOlderAdult: prescription.idOlderAdult,
                    scheduledTime,
                    administeredTime: null,
                    status,
                    doseGiven: prescription.dosage,
                    prescription,
                    olderAdult: prescription.olderAdult,
                    projected: true,
                    projectedKey: key,
                });
            }
        }

        const data = [...actual, ...projected].sort(
            (left, right) => left.scheduledTime.getTime() - right.scheduledTime.getTime(),
        );
        return { message: `Kardex retrieved successfully for ${targetDate}`, data };
    }

    async recordAdministration(
        dto: RecordAdministrationDto,
        staffId: number,
    ): Promise<{ message: string; data: MedicationAdministration }> {
        if (dto.status === AdministrationStatus.SCHEDULED) {
            throw new BadRequestException('El estado scheduled solo es una proyección; registre una administración real');
        }
        this.validateOutcome(dto);

        if (dto.id) {
            const existing = await this.adminRepo.findOne({
                where: { id: dto.id },
                relations: ['prescription', 'olderAdult'],
            });
            if (!existing) throw new NotFoundException(`Administration entry with ID ${dto.id} not found`);

            return this.adminRepo.manager.transaction(async (manager) => {
                const repository = manager.getRepository(MedicationAdministration);
                const administration = await repository.findOne({
                    where: { id: dto.id! },
                    lock: { mode: 'pessimistic_write' },
                });
                if (!administration) throw new NotFoundException(`Administration entry with ID ${dto.id} not found`);
                administration.status = dto.status;
                administration.administeredTime = dto.status === AdministrationStatus.ADMINISTERED
                    ? new Date(dto.administeredTime ?? new Date().toISOString())
                    : null;
                administration.administeredBy = staffId;
                administration.doseGiven = dto.status === AdministrationStatus.ADMINISTERED
                    ? dto.doseGiven ?? existing.prescription?.dosage ?? administration.doseGiven
                    : null;
                administration.omissionReason = dto.omissionReason ?? null;
                administration.observations = dto.observations ?? null;
                return {
                    message: 'Medication administration recorded successfully',
                    data: await repository.save(administration),
                };
            });
        }

        if (!dto.idPrescription || !dto.idOlderAdult || !dto.scheduledTime) {
            throw new BadRequestException(
                'idPrescription, idOlderAdult y scheduledTime son obligatorios para registrar una dosis proyectada o PRN',
            );
        }
        const scheduledTime = new Date(dto.scheduledTime);
        if (!Number.isFinite(scheduledTime.getTime())) throw new BadRequestException('scheduledTime no es una fecha válida');

        return this.adminRepo.manager.transaction(async (manager) => {
            const prescription = await manager.getRepository(MedicationPrescription).findOne({
                where: { id: dto.idPrescription! },
                lock: { mode: 'pessimistic_write' },
            });
            if (!prescription || prescription.idOlderAdult !== dto.idOlderAdult) {
                throw new NotFoundException('La prescripción no pertenece al residente indicado');
            }
            if (prescription.status !== PrescriptionStatus.ACTIVE) {
                throw new BadRequestException('Solo se pueden registrar dosis de una prescripción activa');
            }
            const scheduledDate = this.costaRicaDateOf(scheduledTime);
            if (scheduledDate < prescription.startDate || (prescription.endDate && scheduledDate > prescription.endDate)) {
                throw new BadRequestException('La fecha programada queda fuera de la vigencia de la prescripción');
            }
            const duplicate = await manager.getRepository(MedicationAdministration).findOne({
                where: {
                    idPrescription: prescription.id,
                    scheduledTime,
                },
            });
            if (duplicate) {
                throw new ConflictException('Ya existe un registro real para esta dosis programada');
            }

            const administration = manager.getRepository(MedicationAdministration).create({
                idPrescription: prescription.id,
                idOlderAdult: prescription.idOlderAdult,
                scheduledTime,
                administeredTime: dto.status === AdministrationStatus.ADMINISTERED
                    ? new Date(dto.administeredTime ?? new Date().toISOString())
                    : null,
                status: dto.status,
                doseGiven: dto.status === AdministrationStatus.ADMINISTERED ? dto.doseGiven ?? prescription.dosage : null,
                administeredBy: staffId,
                omissionReason: dto.omissionReason ?? null,
                observations: dto.observations ?? null,
            });
            const saved = await manager.getRepository(MedicationAdministration).save(administration);
            return { message: 'Medication administration recorded successfully', data: saved };
        });
    }

    private validateOutcome(dto: RecordAdministrationDto): void {
        if ([AdministrationStatus.OMITTED, AdministrationStatus.REFUSED].includes(dto.status) && !dto.omissionReason?.trim()) {
            throw new BadRequestException('omissionReason es obligatorio cuando la dosis se omite o rechaza');
        }
    }

    private async residentsOnTemporaryAbsence(residentIds: number[]): Promise<Set<number>> {
        if (residentIds.length === 0) return new Set();
        const context = getTenantContext();
        if (!context) throw new BadRequestException('No se encontró el contexto de organización del Kardex');
        const rows = await this.adminRepo.manager.query(
            `SELECT DISTINCT id_older_adult
             FROM public.resident_stays
             WHERE tenant_id = $1 AND id_older_adult = ANY($2::integer[])
               AND status = 'temporary_absence'`,
            [context.tenantId, residentIds],
        ) as Array<{ id_older_adult: number }>;
        return new Set(rows.map((row) => Number(row.id_older_adult)));
    }

    private projectSchedule(prescription: MedicationPrescription, targetDate: string): Date[] {
        if (prescription.specificSchedule?.trim()) {
            const matches = prescription.specificSchedule.match(/\b(?:[01]\d|2[0-3]):[0-5]\d\b/g) ?? [];
            return [...new Set(matches)].map((time) => this.costaRicaDateTime(targetDate, time));
        }

        if (!prescription.frequencyHours || prescription.frequencyHours <= 0) {
            return [this.costaRicaDateTime(targetDate, '08:00')];
        }
        const startDate = prescription.startDate.slice(0, 10);
        const daysSinceStart = Math.floor(
            (Date.parse(`${targetDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / DAY_IN_MILLISECONDS,
        );
        const intervalMinutes = prescription.frequencyHours * 60;
        const slots: Date[] = [];
        for (let minute = 0; minute < 24 * 60; minute += 1) {
            if (((daysSinceStart * 24 * 60) + minute) % intervalMinutes === 0) {
                const hour = String(Math.floor(minute / 60)).padStart(2, '0');
                const mins = String(minute % 60).padStart(2, '0');
                slots.push(this.costaRicaDateTime(targetDate, `${hour}:${mins}`));
            }
        }
        return slots;
    }

    private slotKey(prescriptionId: number, scheduledTime: Date): string {
        return `${prescriptionId}:${scheduledTime.toISOString()}`;
    }

    private currentCostaRicaDate(): string {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: COSTA_RICA_TIME_ZONE,
            year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(new Date());
        const value = (kind: string) => parts.find((part) => part.type === kind)?.value;
        return `${value('year')}-${value('month')}-${value('day')}`;
    }

    private assertDateOnly(value: string): void {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)
            || Number.isNaN(Date.parse(`${value}T00:00:00Z`))
            || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
            throw new BadRequestException('date debe tener formato YYYY-MM-DD');
        }
    }

    private addDays(value: string, days: number): string {
        return new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);
    }

    private costaRicaDateTime(date: string, time: string): Date {
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const utcMinutes = (hour * 60 + minute) - COSTA_RICA_UTC_OFFSET_MINUTES;
        return new Date(Date.UTC(year, month - 1, day, 0, utcMinutes));
    }

    private costaRicaDateOf(value: Date): string {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: COSTA_RICA_TIME_ZONE,
            year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(value);
        const field = (kind: string) => parts.find((part) => part.type === kind)?.value;
        return `${field('year')}-${field('month')}-${field('day')}`;
    }
}
