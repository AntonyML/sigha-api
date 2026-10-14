import {
    Injectable,
    InternalServerErrorException,
    ConflictException,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { LoggerService } from '@common/services/logger.service';
import { Repository, ILike } from 'typeorm';
import { ClinicalCondition } from '../../domain/virtual-records';
import {
    Icd10Catalog,
    PatientCondition,
    ConditionStatus,
} from '../../domain/clinical-conditions';
import { OlderAdult } from '../../domain/virtual-records/older-adult.entity';
import {
    CreateClinicalConditionDto,
    CreatePatientConditionDto,
    UpdatePatientConditionDto,
    Icd10QueryDto,
} from '../../dto/clinical-conditions';

@Injectable()
export class ClinicalConditionsService {
    constructor(
        private logger: LoggerService,
        @Inject('ClinicalConditionRepository')
        private readonly clinicalConditionRepository: Repository<ClinicalCondition>,
        @Inject('Icd10CatalogRepository')
        private readonly icd10Repo: Repository<Icd10Catalog>,
        @Inject('PatientConditionRepository')
        private readonly patientConditionRepo: Repository<PatientCondition>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepo: Repository<OlderAdult>,
    ) {}

    // ==========================================
    // 1. Catálogo Legacy (clinical_conditions)
    // ==========================================

    async createClinicalCondition(
        createClinicalConditionDto: CreateClinicalConditionDto
    ): Promise<{ message: string; data: ClinicalCondition }> {
        try {
            const existingCondition = await this.clinicalConditionRepository.findOne({
                where: { ccName: createClinicalConditionDto.ccName },
            });

            if (existingCondition) {
                throw new ConflictException('A clinical condition with this name already exists');
            }

            const newCondition = new ClinicalCondition(
                undefined,
                createClinicalConditionDto.ccName
            );

            const savedCondition = await this.clinicalConditionRepository.save(newCondition);

            return {
                message: 'Clinical condition created successfully',
                data: savedCondition,
            };
        } catch (error) {
            if (error instanceof ConflictException) throw error;
            this.logger.error('Error creating clinical condition', error.stack, { service: 'ClinicalConditionsService' });
            throw new InternalServerErrorException('Failed to create clinical condition');
        }
    }

    async getAllClinicalConditions(): Promise<{ message: string; data: any[] }> {
        try {
            const conditions = await this.clinicalConditionRepository.find({
                order: { id: 'ASC' },
            });

            return {
                message: 'Clinical conditions retrieved successfully',
                data: conditions.map(condition => ({
                    id: condition.id,
                    ccName: condition.ccName,
                })),
            };
        } catch (error) {
            this.logger.error('Error retrieving clinical conditions', error.stack, { service: 'ClinicalConditionsService' });
            throw new InternalServerErrorException('Failed to retrieve clinical conditions');
        }
    }

    // ==========================================
    // 2. Catálogo Oficial CIE-10 (icd10_catalog)
    // ==========================================

    async searchIcd10(query?: Icd10QueryDto): Promise<{ message: string; data: Icd10Catalog[] }> {
        const qb = this.icd10Repo.createQueryBuilder('icd')
            .where('icd.is_active = TRUE');

        if (query?.search) {
            qb.andWhere('(icd.code ILIKE :search OR icd.description ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }

        if (query?.category) {
            qb.andWhere('icd.category ILIKE :category', {
                category: `%${query.category}%`,
            });
        }

        qb.orderBy('icd.code', 'ASC');
        const list = await qb.getMany();

        return { message: 'ICD-10 catalog retrieved successfully', data: list };
    }

    // ==========================================
    // 3. Condiciones Médicas del Paciente (patient_conditions)
    // ==========================================

    async createPatientCondition(
        dto: CreatePatientConditionDto
    ): Promise<{ message: string; data: PatientCondition }> {
        const resident = await this.olderAdultRepo.findOne({ where: { id: dto.idOlderAdult } });
        if (!resident) {
            throw new NotFoundException(`Resident with ID ${dto.idOlderAdult} not found`);
        }

        if (dto.idIcd10) {
            const icd = await this.icd10Repo.findOne({ where: { id: dto.idIcd10 } });
            if (!icd) {
                throw new NotFoundException(`ICD-10 entry with ID ${dto.idIcd10} not found`);
            }
        }

        const condition = this.patientConditionRepo.create({
            idOlderAdult: dto.idOlderAdult,
            idIcd10: dto.idIcd10,
            customDiagnosisName: dto.customDiagnosisName,
            status: dto.status || ConditionStatus.ACTIVE,
            severity: dto.severity,
            onsetDate: dto.onsetDate,
            resolvedDate: dto.resolvedDate,
            notes: dto.notes,
        });

        const saved = await this.patientConditionRepo.save(condition);
        return { message: 'Patient condition recorded successfully', data: saved };
    }

    async getConditionsByResident(
        olderAdultId: number,
        status?: ConditionStatus
    ): Promise<{ message: string; data: PatientCondition[] }> {
        const resident = await this.olderAdultRepo.findOne({ where: { id: olderAdultId } });
        if (!resident) {
            throw new NotFoundException(`Resident with ID ${olderAdultId} not found`);
        }

        const where: any = { idOlderAdult: olderAdultId };
        if (status) {
            where.status = status;
        }

        const conditions = await this.patientConditionRepo.find({
            where,
            relations: ['icd10'],
            order: { createdAt: 'DESC' },
        });

        return { message: 'Patient conditions retrieved successfully', data: conditions };
    }

    async updatePatientCondition(
        id: number,
        dto: UpdatePatientConditionDto
    ): Promise<{ message: string; data: PatientCondition }> {
        const condition = await this.patientConditionRepo.findOne({ where: { id } });
        if (!condition) {
            throw new NotFoundException(`Patient condition with ID ${id} not found`);
        }

        Object.assign(condition, dto);
        const updated = await this.patientConditionRepo.save(condition);
        return { message: 'Patient condition updated successfully', data: updated };
    }
}