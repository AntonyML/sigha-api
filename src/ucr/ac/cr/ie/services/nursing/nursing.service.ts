import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In, Not } from 'typeorm';
import { SpecializedAppointment, SpecializedAreaName, AppointmentStatus, NursingRecord, SpecializedArea } from '../../domain/nursing';
import { GetNursingAppointmentsDto, CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, CompleteAppointmentDto } from '../../dto/nursing';
import { OlderAdult } from '../../domain/virtual-records';
import { User } from '../../domain/auth/core/user.entity';

@Injectable()
export class NursingService {
    constructor(
        @Inject('SpecializedAppointmentRepository')
        private readonly appointmentRepository: Repository<SpecializedAppointment>,
        @Inject('NursingRecordRepository')
        private readonly nursingRecordRepository: Repository<NursingRecord>,
        @Inject('SpecializedAreaRepository')
        private readonly specializedAreaRepository: Repository<SpecializedArea>,
        @Inject('OlderAdultRepository')
        private readonly olderAdultRepository: Repository<OlderAdult>,
        @Inject('DataSource')
        private readonly dataSource: any
    ) {}

    async getNursingAppointments(filters?: GetNursingAppointmentsDto): Promise<{ message: string; data: any[] }> {
        try {
            const queryBuilder = this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.area', 'area')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff')
                .where('area.sa_name = :areaName', { areaName: SpecializedAreaName.NURSING });

            // Aplicar filtros opcionales
            if (filters?.status) {
                queryBuilder.andWhere('appointment.sa_status = :status', { status: filters.status });
            }

            if (filters?.priority) {
                queryBuilder.andWhere('appointment.sa_priority = :priority', { priority: filters.priority });
            }

            if (filters?.dateFrom && filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date BETWEEN :dateFrom AND :dateTo', {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
                });
            } else if (filters?.dateFrom) {
                queryBuilder.andWhere('appointment.sa_appointment_date >= :dateFrom', {
                    dateFrom: filters.dateFrom
                });
            } else if (filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date <= :dateTo', {
                    dateTo: filters.dateTo
                });
            }

            // Ordenar por fecha de cita
            queryBuilder.orderBy('appointment.sa_appointment_date', 'DESC');

            const appointments = await queryBuilder.getMany();

            return {
                message: 'Nursing appointments retrieved successfully',
                data: appointments.map(appointment => ({
                    id: appointment.id,
                    appointmentDate: appointment.saAppointmentDate,
                    appointmentType: appointment.saAppointmentType,
                    priority: appointment.saPriority,
                    status: appointment.saStatus,
                    notes: appointment.saNotes,
                    observations: appointment.saObservations,
                    durationMinutes: appointment.saDurationMinutes,
                    nextAppointment: appointment.saNextAppointment,
                    createAt: appointment.createAt,
                    area: appointment.area ? {
                        id: appointment.area.id,
                        name: appointment.area.saName,
                        description: appointment.area.saDescription
                    } : null,
                    patient: appointment.patient ? {
                        id: appointment.patient.id,
                        identification: appointment.patient.oaIdentification,
                        name: appointment.patient.oaName,
                        firstLastName: appointment.patient.oaFLastName,
                        secondLastName: appointment.patient.oaSLastName
                    } : null,
                    staff: appointment.staff ? {
                        id: appointment.staff.id,
                        name: appointment.staff.uName,
                        firstLastName: appointment.staff.uFLastName,
                        secondLastName: appointment.staff.uSLastName,
                        email: appointment.staff.uEmail
                    } : null
                }))
            };

        } catch (error) {
            console.error('Error retrieving nursing appointments:', error);
            throw new InternalServerErrorException('Failed to retrieve nursing appointments');
        }
    }

    async getPendingAppointments(filters?: GetNursingAppointmentsDto): Promise<{ message: string; data: any[] }> {
        try {
            const queryBuilder = this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.area', 'area')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff')
                .where('area.sa_name = :areaName', { areaName: SpecializedAreaName.NURSING })
                .andWhere('appointment.sa_status IN (:...statuses)', { 
                    statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.RESCHEDULED] 
                });

            // Aplicar filtros opcionales
            if (filters?.priority) {
                queryBuilder.andWhere('appointment.sa_priority = :priority', { priority: filters.priority });
            }

            if (filters?.dateFrom && filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date BETWEEN :dateFrom AND :dateTo', {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
                });
            } else if (filters?.dateFrom) {
                queryBuilder.andWhere('appointment.sa_appointment_date >= :dateFrom', {
                    dateFrom: filters.dateFrom
                });
            } else if (filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date <= :dateTo', {
                    dateTo: filters.dateTo
                });
            }

            // Ordenar por fecha de cita (próximas primero)
            queryBuilder.orderBy('appointment.sa_appointment_date', 'ASC');

            const appointments = await queryBuilder.getMany();

            return {
                message: 'Pending nursing appointments retrieved successfully',
                data: appointments.map(appointment => this.mapAppointmentToResponse(appointment))
            };

        } catch (error) {
            console.error('Error retrieving pending nursing appointments:', error);
            throw new InternalServerErrorException('Failed to retrieve pending nursing appointments');
        }
    }

    async getCompletedAppointments(filters?: GetNursingAppointmentsDto): Promise<{ message: string; data: any[] }> {
        try {
            const queryBuilder = this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.area', 'area')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff')
                .where('area.sa_name = :areaName', { areaName: SpecializedAreaName.NURSING })
                .andWhere('appointment.sa_status = :status', { status: AppointmentStatus.COMPLETED });

            // Aplicar filtros opcionales
            if (filters?.priority) {
                queryBuilder.andWhere('appointment.sa_priority = :priority', { priority: filters.priority });
            }

            if (filters?.dateFrom && filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date BETWEEN :dateFrom AND :dateTo', {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
                });
            } else if (filters?.dateFrom) {
                queryBuilder.andWhere('appointment.sa_appointment_date >= :dateFrom', {
                    dateFrom: filters.dateFrom
                });
            } else if (filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date <= :dateTo', {
                    dateTo: filters.dateTo
                });
            }

            // Ordenar por fecha de cita (más recientes primero)
            queryBuilder.orderBy('appointment.sa_appointment_date', 'DESC');

            const appointments = await queryBuilder.getMany();

            // Obtener los registros de enfermería para cada cita
            const appointmentsWithRecords = await Promise.all(
                appointments.map(async (appointment) => {
                    const nursingRecord = await this.nursingRecordRepository.findOne({
                        where: { idAppointment: appointment.id }
                    });

                    return {
                        ...this.mapAppointmentToResponse(appointment),
                        nursingRecord: nursingRecord ? {
                            id: nursingRecord.id,
                            date: nursingRecord.nrDate,
                            temperature: nursingRecord.nrTemperature,
                            bloodPressure: nursingRecord.nrBloodPressure,
                            heartRate: nursingRecord.nrHeartRate,
                            painLevel: nursingRecord.nrPainLevel,
                            mobility: nursingRecord.nrMobility,
                            appetite: nursingRecord.nrAppetite,
                            sleepQuality: nursingRecord.nrSleepQuality,
                            notes: nursingRecord.nrNotes,
                            createAt: nursingRecord.createAt
                        } : null
                    };
                })
            );

            return {
                message: 'Completed nursing appointments retrieved successfully',
                data: appointmentsWithRecords
            };

        } catch (error) {
            console.error('Error retrieving completed nursing appointments:', error);
            throw new InternalServerErrorException('Failed to retrieve completed nursing appointments');
        }
    }

    async getCancelledAppointments(filters?: GetNursingAppointmentsDto): Promise<{ message: string; data: any[] }> {
        try {
            const queryBuilder = this.appointmentRepository
                .createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.area', 'area')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff')
                .where('area.sa_name = :areaName', { areaName: SpecializedAreaName.NURSING })
                .andWhere('appointment.sa_status = :status', { status: AppointmentStatus.CANCELLED });

            // Aplicar filtros opcionales
            if (filters?.priority) {
                queryBuilder.andWhere('appointment.sa_priority = :priority', { priority: filters.priority });
            }

            if (filters?.dateFrom && filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date BETWEEN :dateFrom AND :dateTo', {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo
                });
            } else if (filters?.dateFrom) {
                queryBuilder.andWhere('appointment.sa_appointment_date >= :dateFrom', {
                    dateFrom: filters.dateFrom
                });
            } else if (filters?.dateTo) {
                queryBuilder.andWhere('appointment.sa_appointment_date <= :dateTo', {
                    dateTo: filters.dateTo
                });
            }

            // Ordenar por fecha de cita
            queryBuilder.orderBy('appointment.sa_appointment_date', 'DESC');

            const appointments = await queryBuilder.getMany();

            return {
                message: 'Cancelled nursing appointments retrieved successfully',
                data: appointments.map(appointment => this.mapAppointmentToResponse(appointment))
            };

        } catch (error) {
            console.error('Error retrieving cancelled nursing appointments:', error);
            throw new InternalServerErrorException('Failed to retrieve cancelled nursing appointments');
        }
    }

    async createAppointment(createDto: CreateAppointmentDto): Promise<{ message: string; data: any }> {
        try {
            // Verificar que el área existe y es de enfermería
            const area = await this.specializedAreaRepository.findOne({
                where: { id: createDto.idArea }
            });

            if (!area) {
                throw new NotFoundException(`Specialized area with ID ${createDto.idArea} not found`);
            }

            if (area.saName !== SpecializedAreaName.NURSING) {
                throw new ConflictException('The specified area is not a nursing area');
            }

            // Verificar que el paciente existe
            const patient = await this.olderAdultRepository.findOne({
                where: { id: createDto.idPatient }
            });

            if (!patient) {
                throw new NotFoundException(`Patient with ID ${createDto.idPatient} not found`);
            }

            // Verificar que el staff existe
            const userRepository = this.dataSource.getRepository(User);
            const staff = await userRepository.findOne({
                where: { id: createDto.idStaff }
            });

            if (!staff) {
                throw new NotFoundException(`Staff member with ID ${createDto.idStaff} not found`);
            }

            // Verificar conflictos de horario
            const appointmentDate = new Date(createDto.saAppointmentDate);
            const existingAppointment = await this.appointmentRepository.findOne({
                where: {
                    idPatient: createDto.idPatient,
                    saAppointmentDate: appointmentDate,
                    saStatus: In([AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS])
                }
            });

            if (existingAppointment) {
                throw new ConflictException('Patient already has an appointment scheduled for this date and time');
            }

            // Crear la cita
            const newAppointment = new SpecializedAppointment(
                undefined,
                appointmentDate,
                createDto.saAppointmentType,
                createDto.saPriority,
                AppointmentStatus.SCHEDULED,
                createDto.saNotes,
                undefined,
                createDto.saDurationMinutes,
                undefined,
                undefined,
                createDto.idArea,
                createDto.idPatient,
                createDto.idStaff
            );

            const savedAppointment = await this.appointmentRepository.save(newAppointment);

            // Cargar las relaciones para la respuesta
            const appointmentWithRelations = await this.appointmentRepository.findOne({
                where: { id: savedAppointment.id },
                relations: ['area', 'patient', 'staff']
            });

            return {
                message: 'Nursing appointment created successfully',
                data: this.mapAppointmentToResponse(appointmentWithRelations)
            };

        } catch (error) {
            console.error('Error creating nursing appointment:', error);
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to create nursing appointment');
        }
    }

    async updateAppointment(id: number, updateDto: UpdateAppointmentDto): Promise<{ message: string; data: any }> {
        try {
            // Buscar la cita existente
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ['area', 'patient', 'staff']
            });

            if (!appointment) {
                throw new NotFoundException(`Appointment with ID ${id} not found`);
            }

            // Verificar que sea una cita de enfermería
            if (appointment.area?.saName !== SpecializedAreaName.NURSING) {
                throw new ConflictException('This appointment does not belong to the nursing area');
            }

            // No permitir actualizar citas completadas
            if (appointment.saStatus === AppointmentStatus.COMPLETED) {
                throw new ConflictException('Cannot update completed appointments. The appointment has already been attended.');
            }

            // No permitir actualizar citas ya canceladas
            if (appointment.saStatus === AppointmentStatus.CANCELLED) {
                throw new ConflictException('Cannot update cancelled appointments. Create a new appointment instead.');
            }

            // Si se está cambiando la fecha, verificar conflictos
            if (updateDto.saAppointmentDate) {
                const newDate = new Date(updateDto.saAppointmentDate);
                const existingAppointment = await this.appointmentRepository.findOne({
                    where: {
                        id: Not(id), // Excluir la cita actual
                        idPatient: appointment.idPatient,
                        saAppointmentDate: newDate,
                        saStatus: In([AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS])
                    }
                });

                if (existingAppointment) {
                    throw new ConflictException('Patient already has an appointment scheduled for this date and time');
                }

                appointment.saAppointmentDate = newDate;
                // Si se reprograma, cambiar el estado
                if (appointment.saStatus === AppointmentStatus.SCHEDULED) {
                    appointment.saStatus = AppointmentStatus.RESCHEDULED;
                }
            }

            // Actualizar campos opcionales
            if (updateDto.saAppointmentType !== undefined) {
                appointment.saAppointmentType = updateDto.saAppointmentType;
            }

            if (updateDto.saPriority !== undefined) {
                appointment.saPriority = updateDto.saPriority;
            }

            if (updateDto.saNotes !== undefined) {
                appointment.saNotes = updateDto.saNotes;
            }

            if (updateDto.saObservations !== undefined) {
                appointment.saObservations = updateDto.saObservations;
            }

            if (updateDto.saDurationMinutes !== undefined) {
                appointment.saDurationMinutes = updateDto.saDurationMinutes;
            }

            // Si se está cambiando el staff, verificar que existe
            if (updateDto.idStaff !== undefined) {
                const userRepository = this.dataSource.getRepository(User);
                const newStaff = await userRepository.findOne({
                    where: { id: updateDto.idStaff }
                });

                if (!newStaff) {
                    throw new NotFoundException(`Staff member with ID ${updateDto.idStaff} not found`);
                }

                appointment.idStaff = updateDto.idStaff;
            }

            // Guardar cambios
            const updatedAppointment = await this.appointmentRepository.save(appointment);

            // Recargar con todas las relaciones actualizadas
            const appointmentWithRelations = await this.appointmentRepository.findOne({
                where: { id: updatedAppointment.id },
                relations: ['area', 'patient', 'staff']
            });

            return {
                message: 'Nursing appointment updated successfully',
                data: this.mapAppointmentToResponse(appointmentWithRelations)
            };

        } catch (error) {
            console.error('Error updating nursing appointment:', error);
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to update nursing appointment');
        }
    }

    async cancelAppointment(id: number, cancelDto: CancelAppointmentDto): Promise<{ message: string; data: any }> {
        try {
            // Buscar la cita existente
            const appointment = await this.appointmentRepository.findOne({
                where: { id },
                relations: ['area', 'patient', 'staff']
            });

            if (!appointment) {
                throw new NotFoundException(`Appointment with ID ${id} not found`);
            }

            // Verificar que sea una cita de enfermería
            if (appointment.area?.saName !== SpecializedAreaName.NURSING) {
                throw new ConflictException('This appointment does not belong to the nursing area');
            }

            // No permitir cancelar citas completadas
            if (appointment.saStatus === AppointmentStatus.COMPLETED) {
                throw new ConflictException('Cannot cancel completed appointments. The appointment has already been attended.');
            }

            // No permitir cancelar citas ya canceladas
            if (appointment.saStatus === AppointmentStatus.CANCELLED) {
                throw new ConflictException('This appointment is already cancelled');
            }

            // Actualizar estado a cancelado
            appointment.saStatus = AppointmentStatus.CANCELLED;

            // Agregar razón de cancelación a las notas
            if (cancelDto.cancellationReason) {
                const cancellationNote = `Cancelado: ${cancelDto.cancellationReason}`;
                appointment.saNotes = appointment.saNotes 
                    ? `${appointment.saNotes}\n\n${cancellationNote}` 
                    : cancellationNote;
            }

            // Guardar cambios
            const cancelledAppointment = await this.appointmentRepository.save(appointment);

            // Recargar con relaciones
            const appointmentWithRelations = await this.appointmentRepository.findOne({
                where: { id: cancelledAppointment.id },
                relations: ['area', 'patient', 'staff']
            });

            return {
                message: 'Nursing appointment cancelled successfully',
                data: this.mapAppointmentToResponse(appointmentWithRelations)
            };

        } catch (error) {
            console.error('Error cancelling nursing appointment:', error);
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to cancel nursing appointment');
        }
    }

    async getAppointmentsByPatient(patientId: number): Promise<{ message: string; data: any }> {
        try {
            // Verificar que el paciente existe
            const patient = await this.olderAdultRepository.findOne({
                where: { id: patientId }
            });

            if (!patient) {
                throw new NotFoundException(`Patient with ID ${patientId} not found`);
            }

            // Buscar todas las citas de enfermería del paciente
            const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.area', 'area')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff')
                .leftJoinAndSelect('appointment.nursingRecords', 'nursingRecords')
                .where('area.sa_name = :areaName', { areaName: SpecializedAreaName.NURSING })
                .andWhere('appointment.id_patient = :patientId', { patientId })
                .orderBy('appointment.sa_appointment_date', 'DESC');

            const appointments = await queryBuilder.getMany();

            return {
                message: `Nursing appointments for patient ${patient.oaName} ${patient.oaFLastName} retrieved successfully`,
                data: appointments.map(appointment => this.mapAppointmentToResponse(appointment))
            };

        } catch (error) {
            console.error('Error retrieving patient nursing appointments:', error);
            
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to retrieve patient nursing appointments');
        }
    }

    async getAppointmentsByPatientIdentification(identification: string): Promise<{ message: string; data: any }> {
        try {
            // Buscar el paciente por su identificación
            const patient = await this.olderAdultRepository.findOne({
                where: { oaIdentification: identification }
            });

            if (!patient) {
                throw new NotFoundException(`Patient with identification ${identification} not found`);
            }

            // Buscar todas las citas de enfermería del paciente
            const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
                .leftJoinAndSelect('appointment.area', 'area')
                .leftJoinAndSelect('appointment.patient', 'patient')
                .leftJoinAndSelect('appointment.staff', 'staff')
                .leftJoinAndSelect('appointment.nursingRecords', 'nursingRecords')
                .where('area.sa_name = :areaName', { areaName: SpecializedAreaName.NURSING })
                .andWhere('appointment.id_patient = :patientId', { patientId: patient.id })
                .orderBy('appointment.sa_appointment_date', 'DESC');

            const appointments = await queryBuilder.getMany();

            return {
                message: `Nursing appointments for patient ${patient.oaName} ${patient.oaFLastName} (${identification}) retrieved successfully`,
                data: appointments.map(appointment => this.mapAppointmentToResponse(appointment))
            };

        } catch (error) {
            console.error('Error retrieving patient nursing appointments by identification:', error);
            
            if (error instanceof NotFoundException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to retrieve patient nursing appointments');
        }
    }

    async getNursingRecordsByAppointment(appointmentId: number): Promise<{ message: string; data: any }> {
        try {
            // Verificar que la cita existe
            const appointment = await this.appointmentRepository.findOne({
                where: { id: appointmentId },
                relations: ['area', 'patient', 'staff']
            });

            if (!appointment) {
                throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
            }

            // Verificar que sea una cita de enfermería
            if (appointment.area?.saName !== SpecializedAreaName.NURSING) {
                throw new ConflictException('This appointment does not belong to the nursing area');
            }

            // Buscar los registros de enfermería de esta cita
            const nursingRecords = await this.nursingRecordRepository.find({
                where: { idAppointment: appointmentId },
                order: { nrDate: 'DESC' }
            });

            // Mapear los registros a un formato de respuesta
            const mappedRecords = nursingRecords.map(record => ({
                id: record.id,
                date: record.nrDate,
                temperature: record.nrTemperature,
                bloodPressure: record.nrBloodPressure,
                heartRate: record.nrHeartRate,
                painLevel: record.nrPainLevel,
                mobility: record.nrMobility,
                appetite: record.nrAppetite,
                sleepQuality: record.nrSleepQuality,
                notes: record.nrNotes,
                createAt: record.createAt
            }));

            return {
                message: `Nursing records for appointment ${appointmentId} retrieved successfully`,
                data: mappedRecords
            };

        } catch (error) {
            console.error('Error retrieving nursing records by appointment:', error);
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to retrieve nursing records');
        }
    }

    async completeAppointment(id: number, completeDto: CompleteAppointmentDto): Promise<{ message: string; data: any }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Buscar la cita existente
            const appointment = await queryRunner.manager.findOne(SpecializedAppointment, {
                where: { id },
                relations: ['area', 'patient', 'staff']
            });

            if (!appointment) {
                throw new NotFoundException(`Appointment with ID ${id} not found`);
            }

            // Verificar que sea una cita de enfermería
            if (appointment.area?.saName !== SpecializedAreaName.NURSING) {
                throw new ConflictException('This appointment does not belong to the nursing area');
            }

            // No permitir completar citas ya completadas
            if (appointment.saStatus === AppointmentStatus.COMPLETED) {
                throw new ConflictException('This appointment is already completed');
            }

            // No permitir completar citas canceladas
            if (appointment.saStatus === AppointmentStatus.CANCELLED) {
                throw new ConflictException('Cannot complete a cancelled appointment');
            }

            // Verificar que no exista ya un registro de enfermería para esta cita
            const existingRecord = await queryRunner.manager.findOne(NursingRecord, {
                where: { idAppointment: id }
            });

            if (existingRecord) {
                throw new ConflictException('A nursing record already exists for this appointment');
            }

            // Crear el registro de enfermería
            const nursingRecord = new NursingRecord(
                undefined, // id
                new Date(), // nrDate
                completeDto.nrTemperature,
                completeDto.nrBloodPressure,
                completeDto.nrHeartRate,
                completeDto.nrPainLevel,
                completeDto.nrMobility,
                completeDto.nrAppetite,
                completeDto.nrSleepQuality,
                completeDto.nrNotes,
                undefined, // createAt (se genera automáticamente)
                id // idAppointment
            );

            const savedNursingRecord = await queryRunner.manager.save(NursingRecord, nursingRecord);

            // Actualizar el estado de la cita a completada
            appointment.saStatus = AppointmentStatus.COMPLETED;
            const completedAppointment = await queryRunner.manager.save(SpecializedAppointment, appointment);

            // Commit de la transacción
            await queryRunner.commitTransaction();

            // Recargar con relaciones para la respuesta
            const appointmentWithRelations = await this.appointmentRepository.findOne({
                where: { id: completedAppointment.id },
                relations: ['area', 'patient', 'staff']
            });

            return {
                message: 'Nursing appointment completed successfully',
                data: {
                    appointment: this.mapAppointmentToResponse(appointmentWithRelations),
                    nursingRecord: {
                        id: savedNursingRecord.id,
                        date: savedNursingRecord.nrDate,
                        temperature: savedNursingRecord.nrTemperature,
                        bloodPressure: savedNursingRecord.nrBloodPressure,
                        heartRate: savedNursingRecord.nrHeartRate,
                        painLevel: savedNursingRecord.nrPainLevel,
                        mobility: savedNursingRecord.nrMobility,
                        appetite: savedNursingRecord.nrAppetite,
                        sleepQuality: savedNursingRecord.nrSleepQuality,
                        notes: savedNursingRecord.nrNotes,
                        createAt: savedNursingRecord.createAt
                    }
                }
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error completing nursing appointment:', error);
            
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            
            throw new InternalServerErrorException('Failed to complete nursing appointment');
        } finally {
            await queryRunner.release();
        }
    }

    private mapAppointmentToResponse(appointment: SpecializedAppointment) {
        return {
            id: appointment.id,
            appointmentDate: appointment.saAppointmentDate,
            appointmentType: appointment.saAppointmentType,
            priority: appointment.saPriority,
            status: appointment.saStatus,
            notes: appointment.saNotes,
            observations: appointment.saObservations,
            durationMinutes: appointment.saDurationMinutes,
            nextAppointment: appointment.saNextAppointment,
            createAt: appointment.createAt,
            area: appointment.area ? {
                id: appointment.area.id,
                name: appointment.area.saName,
                description: appointment.area.saDescription
            } : null,
            patient: appointment.patient ? {
                id: appointment.patient.id,
                identification: appointment.patient.oaIdentification,
                name: appointment.patient.oaName,
                firstLastName: appointment.patient.oaFLastName,
                secondLastName: appointment.patient.oaSLastName
            } : null,
            staff: appointment.staff ? {
                id: appointment.staff.id,
                name: appointment.staff.uName,
                firstLastName: appointment.staff.uFLastName,
                secondLastName: appointment.staff.uSLastName,
                email: appointment.staff.uEmail
            } : null
        };
    }
}
