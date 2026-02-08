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
        try {
            // Validar que la cita existe y pertenece a fisioterapia
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

            // Create session data
            const sessionData: Partial<PhysiotherapySession> = {
                ps_date: dto.ps_date ? new Date(dto.ps_date) : new Date(),
                ps_type: dto.ps_type,
                ps_mobility_level: dto.ps_mobility_level,
                ps_pain_level: dto.ps_pain_level,
                ps_treatment_description: dto.ps_treatment_description,
                ps_exercise_plan: dto.ps_exercise_plan,
                ps_progress_notes: dto.ps_progress_notes,
                id_appointment: appointment
            };

            const session = this.physiotherapyRepository.create(sessionData);
            const savedSession = await this.physiotherapyRepository.save(session);

            return {
                message: 'Physiotherapy session created successfully',
                data: savedSession
            };
        } catch (error) {
            throw error;
        }
    }

    async getPhysiotherapySessions(appointmentId?: number): Promise<{ message: string; data: PhysiotherapySession[] }> {
        try {
            const query = this.physiotherapyRepository
                .createQueryBuilder('session')
                .leftJoinAndSelect('session.id_appointment', 'appointment')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff');

            if (appointmentId) {
                query.andWhere('appointment.id = :appointmentId', { appointmentId });
            }

            const sessions = await query.getMany();

            return {
                message: 'Physiotherapy sessions retrieved successfully',
                data: sessions
            };
        } catch (error) {
            throw error;
        }
    }

    async getPhysiotherapySessionById(id: number): Promise<{ message: string; data: PhysiotherapySession }> {
        try {
            const session = await this.physiotherapyRepository.findOne({
                where: { id },
                relations: ['id_appointment', 'id_appointment.patient', 'id_appointment.staff']
            });

            if (!session) {
                throw new NotFoundException('Physiotherapy session not found');
            }

            return {
                message: 'Physiotherapy session retrieved successfully',
                data: session
            };
        } catch (error) {
            throw error;
        }
    }

    async updatePhysiotherapySession(id: number, dto: UpdatePhysiotherapySessionDto): Promise<{ message: string; data: PhysiotherapySession }> {
        try {
            const session = await this.physiotherapyRepository.findOne({ where: { id } });

            if (!session) {
                throw new NotFoundException('Physiotherapy session not found');
            }

            // Create update data
            const updateData: Partial<PhysiotherapySession> = {};
            if (dto.ps_date !== undefined) updateData.ps_date = new Date(dto.ps_date);
            if (dto.ps_type !== undefined) updateData.ps_type = dto.ps_type;
            if (dto.ps_mobility_level !== undefined) updateData.ps_mobility_level = dto.ps_mobility_level;
            if (dto.ps_pain_level !== undefined) updateData.ps_pain_level = dto.ps_pain_level;
            if (dto.ps_treatment_description !== undefined) updateData.ps_treatment_description = dto.ps_treatment_description;
            if (dto.ps_exercise_plan !== undefined) updateData.ps_exercise_plan = dto.ps_exercise_plan;
            if (dto.ps_progress_notes !== undefined) updateData.ps_progress_notes = dto.ps_progress_notes;

            await this.physiotherapyRepository.update(id, updateData);
            const updatedSession = await this.physiotherapyRepository.findOne({
                where: { id },
                relations: ['id_appointment']
            });

            return {
                message: 'Physiotherapy session updated successfully',
                data: updatedSession
            };
        } catch (error) {
            throw error;
        }
    }

    async deletePhysiotherapySession(id: number): Promise<{ message: string }> {
        try {
            const session = await this.physiotherapyRepository.findOne({ where: { id } });

            if (!session) {
                throw new NotFoundException('Physiotherapy session not found');
            }

            await this.physiotherapyRepository.delete(id);

            return {
                message: 'Physiotherapy session deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }
}