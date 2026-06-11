import { Injectable, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClinicalMedication, TreatmentType } from '../../domain/virtual-records';
import { CreateClinicalMedicationDto } from '../../dto/clinical-medication/create-clinical-medication.dto';
import { UpdateClinicalMedicationDto } from '../../dto/clinical-medication/update-clinical-medication.dto';

@Injectable()
export class ClinicalMedicationService {
    constructor(
        @Inject('ClinicalMedicationRepository')
        private readonly clinicalMedicationRepository: Repository<ClinicalMedication>
    ) {}

    async create(dto: CreateClinicalMedicationDto): Promise<{ message: string; data: ClinicalMedication }> {
        try {
            const medication = this.clinicalMedicationRepository.create({
                mMedication: dto.mMedication,
                mDosage: dto.mDosage,
                mTreatmentType: dto.mTreatmentType || TreatmentType.OTHER,
                idClinicalHistory: dto.idClinicalHistory,
            });
            const saved = await this.clinicalMedicationRepository.save(medication);
            return { message: 'Clinical medication created successfully', data: saved };
        } catch (error) {
            console.error('Error creating clinical medication:', error);
            throw new InternalServerErrorException('Failed to create clinical medication');
        }
    }

    async findAll(): Promise<{ message: string; data: ClinicalMedication[] }> {
        try {
            const medications = await this.clinicalMedicationRepository.find({ order: { id: 'ASC' } });
            return { message: 'Clinical medications retrieved successfully', data: medications };
        } catch (error) {
            console.error('Error retrieving clinical medications:', error);
            throw new InternalServerErrorException('Failed to retrieve clinical medications');
        }
    }

    async findByClinicalHistory(clinicalHistoryId: number): Promise<{ message: string; data: ClinicalMedication[] }> {
        try {
            const medications = await this.clinicalMedicationRepository.find({
                where: { idClinicalHistory: clinicalHistoryId },
                order: { id: 'ASC' },
            });
            return { message: 'Clinical medications retrieved successfully', data: medications };
        } catch (error) {
            console.error('Error retrieving clinical medications by history:', error);
            throw new InternalServerErrorException('Failed to retrieve clinical medications');
        }
    }

    async findOne(id: number): Promise<{ message: string; data: ClinicalMedication }> {
        try {
            const medication = await this.clinicalMedicationRepository.findOne({ where: { id } });
            if (!medication) throw new NotFoundException(`Clinical medication with id ${id} not found`);
            return { message: 'Clinical medication retrieved successfully', data: medication };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error retrieving clinical medication:', error);
            throw new InternalServerErrorException('Failed to retrieve clinical medication');
        }
    }

    async update(id: number, dto: UpdateClinicalMedicationDto): Promise<{ message: string; data: ClinicalMedication }> {
        try {
            const medication = await this.clinicalMedicationRepository.findOne({ where: { id } });
            if (!medication) throw new NotFoundException(`Clinical medication with id ${id} not found`);
            Object.assign(medication, dto);
            const updated = await this.clinicalMedicationRepository.save(medication);
            return { message: 'Clinical medication updated successfully', data: updated };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error updating clinical medication:', error);
            throw new InternalServerErrorException('Failed to update clinical medication');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const medication = await this.clinicalMedicationRepository.findOne({ where: { id } });
            if (!medication) throw new NotFoundException(`Clinical medication with id ${id} not found`);
            await this.clinicalMedicationRepository.remove(medication);
            return { message: 'Clinical medication deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error deleting clinical medication:', error);
            throw new InternalServerErrorException('Failed to delete clinical medication');
        }
    }
}
