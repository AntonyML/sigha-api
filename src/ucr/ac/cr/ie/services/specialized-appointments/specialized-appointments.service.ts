import { Injectable, InternalServerErrorException, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SpecializedAppointment, AppointmentType, AppointmentPriority, AppointmentStatus } from '../../domain/nursing';
import { CreateSpecializedAppointmentDto } from '../../dto/specialized-appointments/create-specialized-appointment.dto';
import { UpdateSpecializedAppointmentDto } from '../../dto/specialized-appointments/update-specialized-appointment.dto';

@Injectable()
export class SpecializedAppointmentsService {
    constructor(
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>
    ) {}

    async create(dto: CreateSpecializedAppointmentDto): Promise<{ message: string; data: SpecializedAppointment }> {
        try {
            const appointment = this.appointmentRepository.create({
                saAppointmentDate: new Date(dto.saAppointmentDate),
                saAppointmentType: dto.saAppointmentType || AppointmentType.CHECKUP,
                saPriority: dto.saPriority || AppointmentPriority.MEDIUM,
                saStatus: dto.saStatus || AppointmentStatus.SCHEDULED,
                saNotes: dto.saNotes,
                saObservations: dto.saObservations,
                saDurationMinutes: dto.saDurationMinutes,
                saNextAppointment: dto.saNextAppointment ? new Date(dto.saNextAppointment) : undefined,
                idArea: dto.idArea,
                idPatient: dto.idPatient,
                idStaff: dto.idStaff,
                createAt: new Date(),
            });
            const saved = await this.appointmentRepository.save(appointment);
            return { message: 'Specialized appointment created successfully', data: saved };
        } catch (error) {
            console.error('Error creating specialized appointment:', error);
            throw new InternalServerErrorException('Failed to create specialized appointment');
        }
    }

    async findAll(patientId?: number, areaId?: number, status?: AppointmentStatus): Promise<{ message: string; data: SpecializedAppointment[] }> {
        try {
            const where: any = {};
            if (patientId) where.idPatient = patientId;
            if (areaId) where.idArea = areaId;
            if (status) where.saStatus = status;

            const appointments = await this.appointmentRepository.find({
                where,
                order: { saAppointmentDate: 'DESC' },
                relations: ['area', 'patient', 'staff'],
            });
            return { message: 'Specialized appointments retrieved successfully', data: appointments };
        } catch (error) {
            console.error('Error retrieving specialized appointments:', error);
            throw new InternalServerErrorException('Failed to retrieve specialized appointments');
        }
    }

    async findOne(id: number): Promise<{ message: string; data: SpecializedAppointment }> {
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ['area', 'patient', 'staff'],
            });
            if (!appointment) throw new NotFoundException(`Specialized appointment with id ${id} not found`);
            return { message: 'Specialized appointment retrieved successfully', data: appointment };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error retrieving specialized appointment:', error);
            throw new InternalServerErrorException('Failed to retrieve specialized appointment');
        }
    }

    async findByPatient(patientId: number): Promise<{ message: string; data: SpecializedAppointment[] }> {
        try {
            const appointments = await this.appointmentRepository.find({
                where: { idPatient: patientId },
                order: { saAppointmentDate: 'DESC' },
                relations: ['area', 'staff'],
            });
            return { message: 'Patient appointments retrieved successfully', data: appointments };
        } catch (error) {
            console.error('Error retrieving patient appointments:', error);
            throw new InternalServerErrorException('Failed to retrieve patient appointments');
        }
    }

    async update(id: number, dto: UpdateSpecializedAppointmentDto): Promise<{ message: string; data: SpecializedAppointment }> {
        try {
            const appointment = await this.appointmentRepository.findOne({ where: { id } });
            if (!appointment) throw new NotFoundException(`Specialized appointment with id ${id} not found`);

            if (dto.saAppointmentDate) appointment.saAppointmentDate = new Date(dto.saAppointmentDate);
            if (dto.saNextAppointment) appointment.saNextAppointment = new Date(dto.saNextAppointment);
            if (dto.saAppointmentType !== undefined) appointment.saAppointmentType = dto.saAppointmentType;
            if (dto.saPriority !== undefined) appointment.saPriority = dto.saPriority;
            if (dto.saStatus !== undefined) appointment.saStatus = dto.saStatus;
            if (dto.saNotes !== undefined) appointment.saNotes = dto.saNotes;
            if (dto.saObservations !== undefined) appointment.saObservations = dto.saObservations;
            if (dto.saDurationMinutes !== undefined) appointment.saDurationMinutes = dto.saDurationMinutes;
            if (dto.idArea !== undefined) appointment.idArea = dto.idArea;
            if (dto.idPatient !== undefined) appointment.idPatient = dto.idPatient;
            if (dto.idStaff !== undefined) appointment.idStaff = dto.idStaff;

            const updated = await this.appointmentRepository.save(appointment);
            return { message: 'Specialized appointment updated successfully', data: updated };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error updating specialized appointment:', error);
            throw new InternalServerErrorException('Failed to update specialized appointment');
        }
    }

    async remove(id: number): Promise<{ message: string }> {
        try {
            const appointment = await this.appointmentRepository.findOne({ where: { id } });
            if (!appointment) throw new NotFoundException(`Specialized appointment with id ${id} not found`);
            await this.appointmentRepository.remove(appointment);
            return { message: 'Specialized appointment deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Error deleting specialized appointment:', error);
            throw new InternalServerErrorException('Failed to delete specialized appointment');
        }
    }
}
