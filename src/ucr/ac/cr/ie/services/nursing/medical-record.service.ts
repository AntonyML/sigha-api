import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../../domain/nursing';
import { OlderAdult } from '../../domain/virtual-records';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from '../../dto/nursing';

@Injectable()
export class MedicalRecordService {
    constructor(
        @Inject('MedicalRecordRepository')
        private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @Inject('OlderAdultRepository')
        private readonly patientRepository: Repository<OlderAdult>,
    ) {}

    async createMedicalRecord(dto: CreateMedicalRecordDto): Promise<{ message: string; data: MedicalRecord }> {
        const patient = await this.patientRepository.findOne({
            where: { id: dto.id_older_adult },
        });

        if (!patient) {
            throw new NotFoundException('Patient (older adult) not found');
        }

        const record = this.medicalRecordRepository.create({
            mrRecordDate: dto.mr_record_date ? new Date(dto.mr_record_date) : new Date(),
            mrSummary: dto.mr_summary,
            mrDiagnosis: dto.mr_diagnosis,
            mrTreatment: dto.mr_treatment,
            mrObservations: dto.mr_observations,
            mrOriginArea: dto.mr_origin_area,
            mrSignedBy: dto.mr_signed_by,
            idOlderAdult: patient.id,
            idAppointment: dto.id_appointment ?? null,
            idStaff: dto.id_staff ?? null,
        });

        const savedRecord = await this.medicalRecordRepository.save(record);

        return {
            message: 'Medical record created successfully',
            data: savedRecord
        };
    }

    async getMedicalRecords(olderAdultId?: number): Promise<{ message: string; data: MedicalRecord[] }> {
        const where: any = {};
        if (olderAdultId) {
            where.idOlderAdult = olderAdultId;
        }

        const records = await this.medicalRecordRepository.find({
            where,
            relations: ['olderAdult', 'appointment', 'staff'],
            order: { mrRecordDate: 'DESC' },
        });

        return {
            message: 'Medical records retrieved successfully',
            data: records
        };
    }

    async getMedicalRecordById(id: number): Promise<{ message: string; data: MedicalRecord }> {
        const record = await this.medicalRecordRepository.findOne({
            where: { id },
            relations: ['olderAdult', 'appointment', 'staff'],
        });

        if (!record) {
            throw new NotFoundException('Medical record not found');
        }

        return {
            message: 'Medical record retrieved successfully',
            data: record
        };
    }

    async updateMedicalRecord(id: number, dto: UpdateMedicalRecordDto): Promise<{ message: string; data: MedicalRecord }> {
        const record = await this.medicalRecordRepository.findOne({ where: { id } });

        if (!record) {
            throw new NotFoundException('Medical record not found');
        }

        if (dto.mr_record_date !== undefined) record.mrRecordDate = new Date(dto.mr_record_date);
        if (dto.mr_summary !== undefined) record.mrSummary = dto.mr_summary;
        if (dto.mr_diagnosis !== undefined) record.mrDiagnosis = dto.mr_diagnosis;
        if (dto.mr_treatment !== undefined) record.mrTreatment = dto.mr_treatment;
        if (dto.mr_observations !== undefined) record.mrObservations = dto.mr_observations;
        if (dto.mr_origin_area !== undefined) record.mrOriginArea = dto.mr_origin_area;
        if (dto.mr_signed_by !== undefined) record.mrSignedBy = dto.mr_signed_by;
        if (dto.id_appointment !== undefined) record.idAppointment = dto.id_appointment ?? null;
        if (dto.id_staff !== undefined) record.idStaff = dto.id_staff ?? null;

        const updatedRecord = await this.medicalRecordRepository.save(record);

        return {
            message: 'Medical record updated successfully',
            data: updatedRecord
        };
    }

    async deleteMedicalRecord(id: number): Promise<{ message: string }> {
        const record = await this.medicalRecordRepository.findOne({ where: { id } });

        if (!record) {
            throw new NotFoundException('Medical record not found');
        }

        await this.medicalRecordRepository.remove(record);

        return {
            message: 'Medical record deleted successfully'
        };
    }
}
