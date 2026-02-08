import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../../domain/nursing';
import { OlderAdult } from '../../domain/virtual-records';
import { User } from '../../domain/auth/core';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from '../../dto/nursing';

@Injectable()
export class MedicalRecordService {
    constructor(
        @Inject('MedicalRecordRepository')
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @Inject('OlderAdultRepository')
        private readonly patientRepository: Repository<OlderAdult>,
        @Inject('UserRepository')
        private readonly userRepository: Repository<User>,
    ) {}

    async createMedicalRecord(dto: CreateMedicalRecordDto, userId: number): Promise<{ message: string; data: MedicalRecord }> {
        try {
            // Validar que el paciente existe
            const patient = await this.patientRepository.findOne({
                where: { id: dto.patient_id }
            });

            if (!patient) {
                throw new NotFoundException('Patient not found');
            }

            // Validar que el usuario existe (opcional, ya que puede ser null)
            let createdBy: User | null = null;
            if (userId) {
                createdBy = await this.userRepository.findOne({
                    where: { id: userId }
                });
            }

            // Create medical record data
            const recordData: Partial<MedicalRecord> = {
                record_date: dto.record_date ? new Date(dto.record_date) : new Date(),
                record_type: dto.record_type,
                chief_complaint: dto.chief_complaint,
                medical_history: dto.medical_history,
                current_medications: dto.current_medications,
                allergies: dto.allergies,
                temperature: dto.temperature,
                blood_pressure_systolic: dto.blood_pressure_systolic,
                blood_pressure_diastolic: dto.blood_pressure_diastolic,
                heart_rate: dto.heart_rate,
                respiratory_rate: dto.respiratory_rate,
                weight_kg: dto.weight_kg,
                height_cm: dto.height_cm,
                vital_signs_status: dto.vital_signs_status,
                physical_examination: dto.physical_examination,
                diagnosis: dto.diagnosis,
                treatment_plan: dto.treatment_plan,
                prescribed_medications: dto.prescribed_medications,
                laboratory_tests: dto.laboratory_tests,
                imaging_studies: dto.imaging_studies,
                follow_up_instructions: dto.follow_up_instructions,
                notes: dto.notes,
                patient: patient,
                created_by: createdBy
            };

            const record = this.medicalRecordRepository.create(recordData);
            const savedRecord = await this.medicalRecordRepository.save(record);

            return {
                message: 'Medical record created successfully',
                data: savedRecord
            };
        } catch (error) {
            throw error;
        }
    }

    async getMedicalRecords(patientId?: number): Promise<{ message: string; data: MedicalRecord[] }> {
        try {
            const query = this.medicalRecordRepository
                .createQueryBuilder('record')
                .leftJoinAndSelect('record.patient', 'patient')
                .leftJoinAndSelect('record.created_by', 'created_by')
                .orderBy('record.record_date', 'DESC');

            if (patientId) {
                query.andWhere('patient.id = :patientId', { patientId });
            }

            const records = await query.getMany();

            return {
                message: 'Medical records retrieved successfully',
                data: records
            };
        } catch (error) {
            throw error;
        }
    }

    async getMedicalRecordById(id: number): Promise<{ message: string; data: MedicalRecord }> {
        try {
            const record = await this.medicalRecordRepository.findOne({
                where: { id },
                relations: ['patient', 'created_by']
            });

            if (!record) {
                throw new NotFoundException('Medical record not found');
            }

            return {
                message: 'Medical record retrieved successfully',
                data: record
            };
        } catch (error) {
            throw error;
        }
    }

    async updateMedicalRecord(id: number, dto: UpdateMedicalRecordDto): Promise<{ message: string; data: MedicalRecord }> {
        try {
            const record = await this.medicalRecordRepository.findOne({ where: { id } });

            if (!record) {
                throw new NotFoundException('Medical record not found');
            }

            // Create update data
            const updateData: Partial<MedicalRecord> = {};
            if (dto.record_date !== undefined) updateData.record_date = new Date(dto.record_date);
            if (dto.record_type !== undefined) updateData.record_type = dto.record_type;
            if (dto.chief_complaint !== undefined) updateData.chief_complaint = dto.chief_complaint;
            if (dto.medical_history !== undefined) updateData.medical_history = dto.medical_history;
            if (dto.current_medications !== undefined) updateData.current_medications = dto.current_medications;
            if (dto.allergies !== undefined) updateData.allergies = dto.allergies;
            if (dto.temperature !== undefined) updateData.temperature = dto.temperature;
            if (dto.blood_pressure_systolic !== undefined) updateData.blood_pressure_systolic = dto.blood_pressure_systolic;
            if (dto.blood_pressure_diastolic !== undefined) updateData.blood_pressure_diastolic = dto.blood_pressure_diastolic;
            if (dto.heart_rate !== undefined) updateData.heart_rate = dto.heart_rate;
            if (dto.respiratory_rate !== undefined) updateData.respiratory_rate = dto.respiratory_rate;
            if (dto.weight_kg !== undefined) updateData.weight_kg = dto.weight_kg;
            if (dto.height_cm !== undefined) updateData.height_cm = dto.height_cm;
            if (dto.vital_signs_status !== undefined) updateData.vital_signs_status = dto.vital_signs_status;
            if (dto.physical_examination !== undefined) updateData.physical_examination = dto.physical_examination;
            if (dto.diagnosis !== undefined) updateData.diagnosis = dto.diagnosis;
            if (dto.treatment_plan !== undefined) updateData.treatment_plan = dto.treatment_plan;
            if (dto.prescribed_medications !== undefined) updateData.prescribed_medications = dto.prescribed_medications;
            if (dto.laboratory_tests !== undefined) updateData.laboratory_tests = dto.laboratory_tests;
            if (dto.imaging_studies !== undefined) updateData.imaging_studies = dto.imaging_studies;
            if (dto.follow_up_instructions !== undefined) updateData.follow_up_instructions = dto.follow_up_instructions;
            if (dto.notes !== undefined) updateData.notes = dto.notes;

            await this.medicalRecordRepository.update(id, updateData);
            const updatedRecord = await this.medicalRecordRepository.findOne({
                where: { id },
                relations: ['patient', 'created_by']
            });

            return {
                message: 'Medical record updated successfully',
                data: updatedRecord
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteMedicalRecord(id: number): Promise<{ message: string }> {
        try {
            const record = await this.medicalRecordRepository.findOne({ where: { id } });

            if (!record) {
                throw new NotFoundException('Medical record not found');
            }

            await this.medicalRecordRepository.delete(id);

            return {
                message: 'Medical record deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }
}