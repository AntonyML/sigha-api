import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PhysiotherapySession } from '../../domain/nursing';
import { SpecializedAppointment } from '../../domain/nursing';

@Injectable()
export class PhysiotherapyService {
    constructor(
        @Inject('PhysiotherapySessionRepository')
        private readonly physiotherapyRepository: Repository<PhysiotherapySession>,
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>,
    ) {}

    async createPhysiotherapySession(data: Partial<PhysiotherapySession>): Promise<{ message: string; data: PhysiotherapySession }> {
        try {
            // Validar que la cita existe y pertenece a fisioterapia
            const appointment = await this.appointmentRepository.findOne({
                where: { id: data.id_appointment.id },
                relations: ['area']
            });

            if (!appointment) {
                throw new NotFoundException('Appointment not found');
            }

            if (appointment.area.saName !== 'physiotherapy') {
                throw new BadRequestException('Appointment does not belong to physiotherapy');
            }

            const session = this.physiotherapyRepository.create(data);
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

    async updatePhysiotherapySession(id: number, data: Partial<PhysiotherapySession>): Promise<{ message: string; data: PhysiotherapySession }> {
        try {
            const session = await this.physiotherapyRepository.findOne({ where: { id } });

            if (!session) {
                throw new NotFoundException('Physiotherapy session not found');
            }

            await this.physiotherapyRepository.update(id, data);
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