import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PhysiotherapySession } from '../../domain/nursing';
import { SpecializedAppointment } from '../../domain/nursing';
import { CreatePhysiotherapySessionDto, UpdatePhysiotherapySessionDto } from '../../dto/nursing';

@Injectable()
export class PhysiotherapyService {
    constructor(
        @Inject('PhysiotherapySessionRepository')
        private readonly physiotherapyRepository: Repository<PhysiotherapySession>,
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>,
    ) {}

    async createPhysiotherapySession(dto: CreatePhysiotherapySessionDto): Promise<{ message: string; data: PhysiotherapySession }> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: dto.id_appointment },
            relations: ['area']
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        if (appointment.area.saName !== 'physiotherapy') {
            throw new BadRequestException('Appointment does not belong to physiotherapy');
        }

        const session = this.physiotherapyRepository.create({
            psDate: dto.ps_date ? new Date(dto.ps_date) : new Date(),
            psType: dto.ps_type,
            psMobilityLevel: dto.ps_mobility_level,
            psPainLevel: dto.ps_pain_level,
            psTreatmentDescription: dto.ps_treatment_description,
            psExercisePlan: dto.ps_exercise_plan,
            psProgressNotes: dto.ps_progress_notes,
            idAppointment: appointment.id,
        });

        const savedSession = await this.physiotherapyRepository.save(session);

        return {
            message: 'Physiotherapy session created successfully',
            data: savedSession
        };
    }

    async getPhysiotherapySessions(appointmentId?: number): Promise<{ message: string; data: PhysiotherapySession[] }> {
        const where: any = {};
        if (appointmentId) {
            where.idAppointment = appointmentId;
        }

        const sessions = await this.physiotherapyRepository.find({
            where,
            relations: ['appointment', 'appointment.patient', 'appointment.staff'],
        });

        return {
            message: 'Physiotherapy sessions retrieved successfully',
            data: sessions
        };
    }

    async getPhysiotherapySessionById(id: number): Promise<{ message: string; data: PhysiotherapySession }> {
        const session = await this.physiotherapyRepository.findOne({
            where: { id },
            relations: ['appointment', 'appointment.patient', 'appointment.staff']
        });

        if (!session) {
            throw new NotFoundException('Physiotherapy session not found');
        }

        return {
            message: 'Physiotherapy session retrieved successfully',
            data: session
        };
    }

    async updatePhysiotherapySession(id: number, dto: UpdatePhysiotherapySessionDto): Promise<{ message: string; data: PhysiotherapySession }> {
        const session = await this.physiotherapyRepository.findOne({ where: { id } });

        if (!session) {
            throw new NotFoundException('Physiotherapy session not found');
        }

        if (dto.ps_date !== undefined) session.psDate = new Date(dto.ps_date);
        if (dto.ps_type !== undefined) session.psType = dto.ps_type;
        if (dto.ps_mobility_level !== undefined) session.psMobilityLevel = dto.ps_mobility_level;
        if (dto.ps_pain_level !== undefined) session.psPainLevel = dto.ps_pain_level;
        if (dto.ps_treatment_description !== undefined) session.psTreatmentDescription = dto.ps_treatment_description;
        if (dto.ps_exercise_plan !== undefined) session.psExercisePlan = dto.ps_exercise_plan;
        if (dto.ps_progress_notes !== undefined) session.psProgressNotes = dto.ps_progress_notes;

        const updatedSession = await this.physiotherapyRepository.save(session);

        return {
            message: 'Physiotherapy session updated successfully',
            data: updatedSession
        };
    }

    async deletePhysiotherapySession(id: number): Promise<{ message: string }> {
        const session = await this.physiotherapyRepository.findOne({ where: { id } });

        if (!session) {
            throw new NotFoundException('Physiotherapy session not found');
        }

        await this.physiotherapyRepository.remove(session);

        return {
            message: 'Physiotherapy session deleted successfully'
        };
    }
}
