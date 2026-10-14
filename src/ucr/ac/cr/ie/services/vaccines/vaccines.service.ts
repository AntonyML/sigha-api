import {
    Injectable,
    InternalServerErrorException,
    ConflictException,
    NotFoundException,
    Inject,
} from '@nestjs/common';
import { LoggerService } from '@common/services/logger.service';
import { Repository } from 'typeorm';
import { Vaccine } from '../../domain/virtual-records';
import { PatientVaccination } from '../../domain/vaccines';
import { OlderAdult } from '../../domain/virtual-records/older-adult.entity';
import {
    CreateVaccineDto,
    CreatePatientVaccinationDto,
    UpdatePatientVaccinationDto,
} from '../../dto/vaccines';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

@Injectable()
export class VaccinesService {
    constructor(
        private logger: LoggerService,
        @Inject('VaccineRepository')
        private readonly vaccineRepository: Repository<Vaccine>,
        @Inject('PatientVaccinationRepository')
        private readonly patientVaccinationRepo: Repository<PatientVaccination>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepo: Repository<OlderAdult>,
    ) {}

    // ==========================================
    // 1. Catálogo Base de Vacunas
    // ==========================================

    async createVaccine(createVaccineDto: CreateVaccineDto): Promise<{ message: string; data: Vaccine }> {
        try {
            const existingVaccine = await this.vaccineRepository.findOne({
                where: { vName: createVaccineDto.vName },
            });

            if (existingVaccine) {
                throw new ConflictException('A vaccine with this name already exists');
            }

            const newVaccine = new Vaccine(
                undefined,
                createVaccineDto.vName
            );

            const savedVaccine = await this.vaccineRepository.save(newVaccine);

            return {
                message: 'Vaccine created successfully',
                data: savedVaccine,
            };
        } catch (error) {
            this.logger.error('creating vaccine', sanitizeForLogging({ error: error instanceof Error ? error.message : 'Unknown error', method: 'create' }));
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Failed to create vaccine');
        }
    }

    async getAllVaccines(): Promise<{ message: string; data: any[] }> {
        try {
            const vaccines = await this.vaccineRepository.find({
                order: { id: 'ASC' },
            });

            return {
                message: 'Vaccines retrieved successfully',
                data: vaccines.map(vaccine => ({
                    id: vaccine.id,
                    vName: vaccine.vName,
                })),
            };
        } catch (error) {
            this.logger.error('retrieving vaccines', sanitizeForLogging({ error: error instanceof Error ? error.message : 'Unknown error', method: 'retrieve' }));
            throw new InternalServerErrorException('Failed to retrieve vaccines');
        }
    }

    // ==========================================
    // 2. Historial de Vacunación del Paciente
    // ==========================================

    async createPatientVaccination(
        dto: CreatePatientVaccinationDto
    ): Promise<{ message: string; data: PatientVaccination }> {
        const resident = await this.olderAdultRepo.findOne({ where: { id: dto.idOlderAdult } });
        if (!resident) {
            throw new NotFoundException(`Resident with ID ${dto.idOlderAdult} not found`);
        }

        if (dto.idVaccine) {
            const vac = await this.vaccineRepository.findOne({ where: { id: dto.idVaccine } });
            if (!vac) {
                throw new NotFoundException(`Vaccine with ID ${dto.idVaccine} not found`);
            }
        }

        const record = this.patientVaccinationRepo.create({
            idOlderAdult: dto.idOlderAdult,
            idVaccine: dto.idVaccine,
            customVaccineName: dto.customVaccineName,
            dose: dto.dose,
            applicationDate: dto.applicationDate,
            lotNumber: dto.lotNumber,
            expirationDate: dto.expirationDate,
            appliedBy: dto.appliedBy,
            adverseReactions: dto.adverseReactions,
            nextBoosterDate: dto.nextBoosterDate,
            observations: dto.observations,
        });

        const saved = await this.patientVaccinationRepo.save(record);
        return { message: 'Vaccination record created successfully', data: saved };
    }

    async getVaccinationsByResident(
        olderAdultId: number
    ): Promise<{ message: string; data: PatientVaccination[] }> {
        const resident = await this.olderAdultRepo.findOne({ where: { id: olderAdultId } });
        if (!resident) {
            throw new NotFoundException(`Resident with ID ${olderAdultId} not found`);
        }

        const records = await this.patientVaccinationRepo.find({
            where: { idOlderAdult: olderAdultId },
            relations: ['vaccine'],
            order: { applicationDate: 'DESC' },
        });

        return { message: 'Patient vaccinations retrieved successfully', data: records };
    }

    async updatePatientVaccination(
        id: number,
        dto: UpdatePatientVaccinationDto
    ): Promise<{ message: string; data: PatientVaccination }> {
        const record = await this.patientVaccinationRepo.findOne({ where: { id } });
        if (!record) {
            throw new NotFoundException(`Vaccination record with ID ${id} not found`);
        }

        Object.assign(record, dto);
        const updated = await this.patientVaccinationRepo.save(record);
        return { message: 'Vaccination record updated successfully', data: updated };
    }
}