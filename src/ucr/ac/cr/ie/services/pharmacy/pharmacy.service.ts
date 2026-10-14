import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import {
    MedicationCatalog,
    MedicationPrescription,
    PrescriptionStatus,
} from '../../domain/pharmacy';
import { OlderAdult } from '../../domain/virtual-records/older-adult.entity';
import {
    CreateMedicationCatalogDto,
    UpdateMedicationCatalogDto,
    CreateMedicationPrescriptionDto,
    UpdateMedicationPrescriptionDto,
} from '../../dto/pharmacy';
import { LoggerService } from '@common/services/logger.service';

@Injectable()
export class PharmacyService {
    constructor(
        private readonly logger: LoggerService,
        @Inject('MedicationCatalogRepository')
        private readonly medicationRepo: Repository<MedicationCatalog>,
        @Inject('MedicationPrescriptionRepository')
        private readonly prescriptionRepo: Repository<MedicationPrescription>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepo: Repository<OlderAdult>,
    ) {}

    // ==========================================
    // 1. Catálogo / Vademécum
    // ==========================================

    async createMedication(dto: CreateMedicationCatalogDto): Promise<{ message: string; data: MedicationCatalog }> {
        const item = this.medicationRepo.create({
            name: dto.name,
            activeSubstance: dto.activeSubstance,
            concentration: dto.concentration,
            pharmaceuticalForm: dto.pharmaceuticalForm,
            defaultRoute: dto.defaultRoute,
            isActive: dto.isActive !== undefined ? dto.isActive : true,
        });

        const saved = await this.medicationRepo.save(item);
        return { message: 'Medication added to catalog successfully', data: saved };
    }

    async findAllMedications(search?: string, activeOnly = true): Promise<{ message: string; data: MedicationCatalog[] }> {
        const query = this.medicationRepo.createQueryBuilder('med');

        if (activeOnly) {
            query.where('med.is_active = :isActive', { isActive: true });
        }

        if (search) {
            query.andWhere(
                '(med.name ILIKE :search OR med.active_substance ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        query.orderBy('med.name', 'ASC');
        const list = await query.getMany();

        return { message: 'Medications retrieved successfully', data: list };
    }

    async findMedicationById(id: number): Promise<{ message: string; data: MedicationCatalog }> {
        const item = await this.medicationRepo.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Medication with ID ${id} not found in catalog`);
        }
        return { message: 'Medication retrieved successfully', data: item };
    }

    async updateMedication(id: number, dto: UpdateMedicationCatalogDto): Promise<{ message: string; data: MedicationCatalog }> {
        const item = await this.medicationRepo.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Medication with ID ${id} not found in catalog`);
        }

        Object.assign(item, dto);
        const updated = await this.medicationRepo.save(item);
        return { message: 'Medication updated successfully', data: updated };
    }

    // ==========================================
    // 2. Prescripciones Médicas (Órdenes)
    // ==========================================

    async createPrescription(
        dto: CreateMedicationPrescriptionDto,
        prescriberId?: number
    ): Promise<{ message: string; data: MedicationPrescription }> {
        const resident = await this.olderAdultRepo.findOne({ where: { id: dto.idOlderAdult } });
        if (!resident) {
            throw new NotFoundException(`Resident (OlderAdult) with ID ${dto.idOlderAdult} not found`);
        }

        if (dto.idMedication) {
            const med = await this.medicationRepo.findOne({ where: { id: dto.idMedication } });
            if (!med) {
                throw new NotFoundException(`Medication with ID ${dto.idMedication} not found in catalog`);
            }
        } else if (!dto.customMedicationName) {
            throw new BadRequestException('Either idMedication or customMedicationName must be provided');
        }

        const prescription = this.prescriptionRepo.create({
            idOlderAdult: dto.idOlderAdult,
            idMedication: dto.idMedication,
            customMedicationName: dto.customMedicationName,
            dosage: dto.dosage,
            route: dto.route,
            frequencyHours: dto.frequencyHours,
            specificSchedule: dto.specificSchedule,
            treatmentType: dto.treatmentType,
            status: PrescriptionStatus.ACTIVE,
            startDate: dto.startDate,
            endDate: dto.endDate,
            instructions: dto.instructions,
            prescribedBy: prescriberId,
            isPrn: dto.isPrn ?? false,
        });

        const saved = await this.prescriptionRepo.save(prescription);
        return { message: 'Prescription created successfully', data: saved };
    }

    async findPrescriptionsByResident(
        olderAdultId: number,
        status?: PrescriptionStatus
    ): Promise<{ message: string; data: MedicationPrescription[] }> {
        const resident = await this.olderAdultRepo.findOne({ where: { id: olderAdultId } });
        if (!resident) {
            throw new NotFoundException(`Resident with ID ${olderAdultId} not found`);
        }

        const where: any = { idOlderAdult: olderAdultId };
        if (status) {
            where.status = status;
        }

        const prescriptions = await this.prescriptionRepo.find({
            where,
            relations: ['medication', 'prescriber'],
            order: { createdAt: 'DESC' },
        });

        return { message: 'Prescriptions retrieved successfully', data: prescriptions };
    }

    async findPrescriptionById(id: number): Promise<{ message: string; data: MedicationPrescription }> {
        const prescription = await this.prescriptionRepo.findOne({
            where: { id },
            relations: ['medication', 'prescriber', 'olderAdult'],
        });

        if (!prescription) {
            throw new NotFoundException(`Prescription with ID ${id} not found`);
        }

        return { message: 'Prescription retrieved successfully', data: prescription };
    }

    async updatePrescription(
        id: number,
        dto: UpdateMedicationPrescriptionDto
    ): Promise<{ message: string; data: MedicationPrescription }> {
        const prescription = await this.prescriptionRepo.findOne({ where: { id } });
        if (!prescription) {
            throw new NotFoundException(`Prescription with ID ${id} not found`);
        }

        Object.assign(prescription, dto);
        const updated = await this.prescriptionRepo.save(prescription);
        return { message: 'Prescription updated successfully', data: updated };
    }

    async cancelPrescription(id: number): Promise<{ message: string; data: MedicationPrescription }> {
        return this.updatePrescription(id, { status: PrescriptionStatus.CANCELLED });
    }
}
