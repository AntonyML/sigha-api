import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PsychologySession } from '../../domain/nursing';
import { SpecializedAppointment } from '../../domain/nursing';
import { CreatePsychologySessionDto, UpdatePsychologySessionDto } from '../../dto/nursing';

@Injectable()
export class PsychologyService {
    constructor(
        @Inject('PsychologySessionRepository')
        private readonly psychologyRepository: Repository<PsychologySession>,
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>,
    ) {}

    async createPsychologySession(dto: CreatePsychologySessionDto): Promise<{ message: string; data: PsychologySession }> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id: dto.id_appointment },
            relations: ['area']
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        if (appointment.area.saName !== 'psychology') {
            throw new BadRequestException('Appointment does not belong to psychology');
        }

        const session = this.psychologyRepository.create({
            psyDate: dto.psy_date ? new Date(dto.psy_date) : new Date(),
            psySessionType: dto.psy_session_type,
            psyMood: dto.psy_mood,
            psyCognitiveStatus: dto.psy_cognitive_status,
            psyObservations: dto.psy_observations,
            psyTherapyGoal: dto.psy_therapy_goal,
            psyProgress: dto.psy_progress,
            idAppointment: appointment.id,
        });

        const savedSession = await this.psychologyRepository.save(session);

        return {
            message: 'Psychology session created successfully',
            data: savedSession
        };
    }

    async getPsychologySessions(appointmentId?: number): Promise<{ message: string; data: PsychologySession[] }> {
        const where: any = {};
        if (appointmentId) {
            where.idAppointment = appointmentId;
        }

        const sessions = await this.psychologyRepository.find({
            where,
            relations: ['appointment', 'appointment.patient', 'appointment.staff'],
        });

        return {
            message: 'Psychology sessions retrieved successfully',
            data: sessions
        };
    }

    async getPsychologySessionById(id: number): Promise<{ message: string; data: PsychologySession }> {
        const session = await this.psychologyRepository.findOne({
            where: { id },
            relations: ['appointment', 'appointment.patient', 'appointment.staff']
        });

        if (!session) {
            throw new NotFoundException('Psychology session not found');
        }

        return {
            message: 'Psychology session retrieved successfully',
            data: session
        };
    }

    async updatePsychologySession(id: number, dto: UpdatePsychologySessionDto): Promise<{ message: string; data: PsychologySession }> {
        const session = await this.psychologyRepository.findOne({ where: { id } });

        if (!session) {
            throw new NotFoundException('Psychology session not found');
        }

        if (dto.psy_date !== undefined) session.psyDate = new Date(dto.psy_date);
        if (dto.psy_session_type !== undefined) session.psySessionType = dto.psy_session_type;
        if (dto.psy_mood !== undefined) session.psyMood = dto.psy_mood;
        if (dto.psy_cognitive_status !== undefined) session.psyCognitiveStatus = dto.psy_cognitive_status;
        if (dto.psy_observations !== undefined) session.psyObservations = dto.psy_observations;
        if (dto.psy_therapy_goal !== undefined) session.psyTherapyGoal = dto.psy_therapy_goal;
        if (dto.psy_progress !== undefined) session.psyProgress = dto.psy_progress;

        const updatedSession = await this.psychologyRepository.save(session);

        return {
            message: 'Psychology session updated successfully',
            data: updatedSession
        };
    }

    async deletePsychologySession(id: number): Promise<{ message: string }> {
        const session = await this.psychologyRepository.findOne({ where: { id } });

        if (!session) {
            throw new NotFoundException('Psychology session not found');
        }

        await this.psychologyRepository.remove(session);

        return {
            message: 'Psychology session deleted successfully'
        };
    }
}
