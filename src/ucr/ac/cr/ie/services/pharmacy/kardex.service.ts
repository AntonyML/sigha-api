import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Repository, Between, In } from 'typeorm';
import {
    MedicationAdministration,
    MedicationPrescription,
    AdministrationStatus,
    PrescriptionStatus,
} from '../../domain/pharmacy';
import { OlderAdult } from '../../domain/virtual-records/older-adult.entity';
import { RecordAdministrationDto, KardexQueryDto } from '../../dto/pharmacy';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class KardexService {
    constructor(
        private readonly logger: LoggerService,
        @Inject('MedicationAdministrationRepository')
        private readonly adminRepo: Repository<MedicationAdministration>,
        @Inject('MedicationPrescriptionRepository')
        private readonly prescriptionRepo: Repository<MedicationPrescription>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepo: Repository<OlderAdult>,
    ) {}

    /**
     * Obtiene la hoja de administración (Kardex) para una fecha determinada.
     * Si no existen registros horarios generados para prescripciones activas en esa fecha,
     * genera automáticamente los slots programados según frequencyHours.
     */
    async getDailyKardex(query: KardexQueryDto): Promise<{ message: string; data: MedicationAdministration[] }> {
        const targetDateStr = query.date || new Date().toISOString().split('T')[0];
        const dayStart = new Date(`${targetDateStr}T00:00:00.000Z`);
        const dayEnd = new Date(`${targetDateStr}T23:59:59.999Z`);

        // 1. Asegurar que las prescripciones activas tengan sus slots generados para el día
        await this.ensureDailySlots(targetDateStr, query.olderAdultId);

        // 2. Consultar registros del día
        const qb = this.adminRepo.createQueryBuilder('admin')
            .leftJoinAndSelect('admin.prescription', 'presc')
            .leftJoinAndSelect('presc.medication', 'med')
            .leftJoinAndSelect('admin.olderAdult', 'patient')
            .leftJoinAndSelect('admin.administrator', 'staff')
            .where('admin.scheduled_time BETWEEN :dayStart AND :dayEnd', { dayStart, dayEnd });

        if (query.olderAdultId) {
            qb.andWhere('admin.id_older_adult = :oaId', { oaId: query.olderAdultId });
        }

        if (query.status) {
            qb.andWhere('admin.status = :status', { status: query.status });
        }

        qb.orderBy('admin.scheduled_time', 'ASC');
        const results = await qb.getMany();

        return {
            message: `Kardex retrieved successfully for ${targetDateStr}`,
            data: results,
        };
    }

    /**
     * Registra la administración de una dosis (administrado, omitido o rechazado).
     */
    async recordAdministration(
        dto: RecordAdministrationDto,
        staffId?: number
    ): Promise<{ message: string; data: MedicationAdministration }> {
        if (dto.id) {
            // Actualizar slot existente
            const admin = await this.adminRepo.findOne({
                where: { id: dto.id },
                relations: ['prescription', 'olderAdult'],
            });

            if (!admin) {
                throw new NotFoundException(`Administration entry with ID ${dto.id} not found`);
            }

            admin.status = dto.status;
            admin.administeredTime = dto.administeredTime ? new Date(dto.administeredTime) : new Date();
            admin.administeredBy = staffId;
            if (dto.doseGiven) admin.doseGiven = dto.doseGiven;
            if (dto.omissionReason) admin.omissionReason = dto.omissionReason;
            if (dto.observations) admin.observations = dto.observations;

            const saved = await this.adminRepo.save(admin);
            return { message: 'Medication administration recorded successfully', data: saved };
        }

        // Crear registro ad-hoc / PRN
        if (!dto.idPrescription || !dto.idOlderAdult) {
            throw new BadRequestException('Either id or (idPrescription and idOlderAdult) must be provided');
        }

        const presc = await this.prescriptionRepo.findOne({ where: { id: dto.idPrescription } });
        if (!presc) {
            throw new NotFoundException(`Prescription with ID ${dto.idPrescription} not found`);
        }

        const newAdmin = this.adminRepo.create({
            idPrescription: dto.idPrescription,
            idOlderAdult: dto.idOlderAdult,
            scheduledTime: new Date(),
            administeredTime: dto.administeredTime ? new Date(dto.administeredTime) : new Date(),
            status: dto.status,
            doseGiven: dto.doseGiven || presc.dosage,
            administeredBy: staffId,
            omissionReason: dto.omissionReason,
            observations: dto.observations,
        });

        const saved = await this.adminRepo.save(newAdmin);
        return { message: 'PRN medication administration created and recorded', data: saved };
    }

    /**
     * Generador automático de slots del Kardex para prescripciones activas
     */
    private async ensureDailySlots(dateStr: string, olderAdultId?: number): Promise<void> {
        const qb = this.prescriptionRepo.createQueryBuilder('presc')
            .where('presc.status = :status', { status: PrescriptionStatus.ACTIVE })
            .andWhere('presc.start_date <= :dateStr', { dateStr })
            .andWhere('(presc.end_date IS NULL OR presc.end_date >= :dateStr)', { dateStr })
            .andWhere('presc.is_prn = FALSE');

        if (olderAdultId) {
            qb.andWhere('presc.id_older_adult = :oaId', { oaId: olderAdultId });
        }

        const activePrescriptions = await qb.getMany();
        const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
        const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

        for (const presc of activePrescriptions) {
            // Verificar si ya tiene slots para este día
            const existingCount = await this.adminRepo.count({
                where: {
                    idPrescription: presc.id,
                    scheduledTime: Between(dayStart, dayEnd),
                },
            });

            if (existingCount > 0) continue;

            // Calcular horas según frequencyHours
            const freq = presc.frequencyHours || 24;
            const slotsToCreate: MedicationAdministration[] = [];

            // Base: 08:00 de la mañana como hora estándar de inicio de ronda diurna
            let currentHour = 8;
            while (currentHour < 24) {
                const scheduledDate = new Date(`${dateStr}T${currentHour.toString().padStart(2, '0')}:00:00.000Z`);
                slotsToCreate.push(
                    this.adminRepo.create({
                        idPrescription: presc.id,
                        idOlderAdult: presc.idOlderAdult,
                        scheduledTime: scheduledDate,
                        status: AdministrationStatus.SCHEDULED,
                        doseGiven: presc.dosage,
                    })
                );

                currentHour += freq;
                if (freq <= 0) break;
            }

            if (slotsToCreate.length > 0) {
                await this.adminRepo.save(slotsToCreate);
            }
        }
    }
}
