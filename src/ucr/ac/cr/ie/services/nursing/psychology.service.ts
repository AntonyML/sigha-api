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
        try {
            // Validar que la cita existe y pertenece a psicología
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

            // Create session data
            const sessionData: Partial<PsychologySession> = {
                psy_date: dto.psy_date ? new Date(dto.psy_date) : new Date(),
                psy_session_type: dto.psy_session_type,
                psy_mood: dto.psy_mood,
                psy_cognitive_status: dto.psy_cognitive_status,
                psy_observations: dto.psy_observations,
                psy_therapy_goal: dto.psy_therapy_goal,
                psy_progress: dto.psy_progress,
                id_appointment: appointment
            };

            const session = this.psychologyRepository.create(sessionData);
            const savedSession = await this.psychologyRepository.save(session);

            return {
                message: 'Psychology session created successfully',
                data: savedSession
            };
        } catch (error) {
            throw error;
        }
    }

    async getPsychologySessions(appointmentId?: number): Promise<{ message: string; data: PsychologySession[] }> {
        try {
            const query = this.psychologyRepository
                .createQueryBuilder('session')
                .leftJoinAndSelect('session.id_appointment', 'appointment')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff');

            if (appointmentId) {
                query.andWhere('appointment.id = :appointmentId', { appointmentId });
            }

            const sessions = await query.getMany();

            return {
                message: 'Psychology sessions retrieved successfully',
                data: sessions
            };
        } catch (error) {
            throw error;
        }
    }

    async getPsychologySessionById(id: number): Promise<{ message: string; data: PsychologySession }> {
        try {
            const session = await this.psychologyRepository.findOne({
                where: { id },
                relations: ['id_appointment', 'id_appointment.patient', 'id_appointment.staff']
            });

            if (!session) {
                throw new NotFoundException('Psychology session not found');
            }

            return {
                message: 'Psychology session retrieved successfully',
                data: session
            };
        } catch (error) {
            throw error;
        }
    }

    async updatePsychologySession(id: number, dto: UpdatePsychologySessionDto): Promise<{ message: string; data: PsychologySession }> {
        try {
            const session = await this.psychologyRepository.findOne({ where: { id } });

            if (!session) {
                throw new NotFoundException('Psychology session not found');
            }

            // Create update data
            const updateData: Partial<PsychologySession> = {};
            if (dto.psy_date !== undefined) updateData.psy_date = new Date(dto.psy_date);
            if (dto.psy_session_type !== undefined) updateData.psy_session_type = dto.psy_session_type;
            if (dto.psy_mood !== undefined) updateData.psy_mood = dto.psy_mood;
            if (dto.psy_cognitive_status !== undefined) updateData.psy_cognitive_status = dto.psy_cognitive_status;
            if (dto.psy_observations !== undefined) updateData.psy_observations = dto.psy_observations;
            if (dto.psy_therapy_goal !== undefined) updateData.psy_therapy_goal = dto.psy_therapy_goal;
            if (dto.psy_progress !== undefined) updateData.psy_progress = dto.psy_progress;

            await this.psychologyRepository.update(id, updateData);
            const updatedSession = await this.psychologyRepository.findOne({
                where: { id },
                relations: ['id_appointment']
            });

            return {
                message: 'Psychology session updated successfully',
                data: updatedSession
            };
        } catch (error) {
            throw error;
        }
    }

    async deletePsychologySession(id: number): Promise<{ message: string }> {
        try {
            const session = await this.psychologyRepository.findOne({ where: { id } });

            if (!session) {
                throw new NotFoundException('Psychology session not found');
            }

            await this.psychologyRepository.delete(id);

            return {
                message: 'Psychology session deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }
}