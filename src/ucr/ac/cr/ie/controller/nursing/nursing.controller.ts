import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NursingService } from '../../services/nursing';
import { GetNursingAppointmentsDto, CreateAppointmentDto, UpdateAppointmentDto, CancelAppointmentDto, CompleteAppointmentDto } from '../../dto/nursing';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Nursing')
@Controller('nursing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class NursingController {
    constructor(private readonly nursingService: NursingService) {}

    @Get('appointments')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get all nursing appointments',
        description: 'Retrieves a list of all nursing appointments with optional filters for status, priority, and date range'
    })
    @ApiResponse({
        status: 200,
        description: 'Nursing appointments retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointments retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            appointmentDate: { type: 'string', format: 'date-time', example: '2025-11-15T10:00:00Z' },
                            appointmentType: { type: 'string', example: 'checkup' },
                            priority: { type: 'string', example: 'medium' },
                            status: { type: 'string', example: 'scheduled' },
                            notes: { type: 'string', example: 'Regular checkup' },
                            observations: { type: 'string', example: 'Patient in good condition' },
                            durationMinutes: { type: 'number', example: 30 },
                            nextAppointment: { type: 'string', format: 'date-time', nullable: true },
                            createAt: { type: 'string', format: 'date-time' },
                            area: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    name: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            },
                            patient: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    identification: { type: 'string' },
                                    name: { type: 'string' },
                                    firstLastName: { type: 'string' },
                                    secondLastName: { type: 'string' }
                                }
                            },
                            staff: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    name: { type: 'string' },
                                    firstLastName: { type: 'string' },
                                    secondLastName: { type: 'string' },
                                    email: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getNursingAppointments(@Query() filters: GetNursingAppointmentsDto) {
        return this.nursingService.getNursingAppointments(filters);
    }

    @Get('appointments/patient/identification/:identification')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get all nursing appointments for a specific patient by identification',
        description: 'Retrieves all nursing appointments (past and future) for a specific patient using their identification number'
    })
    @ApiResponse({
        status: 200,
        description: 'Patient nursing appointments retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointments for patient María Elena González (1-1234-5679) retrieved successfully' },
                data: { type: 'array' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Patient not found'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getAppointmentsByPatientIdentification(@Param('identification') identification: string) {
        return this.nursingService.getAppointmentsByPatientIdentification(identification);
    }

    @Get('appointments/patient/:patientId')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get all nursing appointments for a specific patient by ID',
        description: 'Retrieves all nursing appointments (past and future) for a specific patient using their ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Patient nursing appointments retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointments for patient María Elena González retrieved successfully' },
                data: { type: 'array' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Patient not found'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getAppointmentsByPatient(@Param('patientId') patientId: string) {
        return this.nursingService.getAppointmentsByPatient(parseInt(patientId, 10));
    }

    @Get('appointments/pending')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get pending nursing appointments',
        description: 'Retrieves a list of pending nursing appointments (scheduled and in progress)'
    })
    @ApiResponse({
        status: 200,
        description: 'Pending nursing appointments retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Pending nursing appointments retrieved successfully' },
                data: { type: 'array' }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getPendingAppointments() {
        return this.nursingService.getPendingAppointments();
    }

    @Get('appointments/completed')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get completed nursing appointments',
        description: 'Retrieves a list of completed nursing appointments with their nursing records'
    })
    @ApiResponse({
        status: 200,
        description: 'Completed nursing appointments retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Completed nursing appointments retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            appointmentDate: { type: 'string', format: 'date-time' },
                            status: { type: 'string', example: 'completed' },
                            patient: { type: 'object' },
                            staff: { type: 'object' },
                            nursingRecord: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    temperature: { type: 'number' },
                                    bloodPressure: { type: 'string' },
                                    heartRate: { type: 'number' },
                                    painLevel: { type: 'number' },
                                    mobility: { type: 'string' },
                                    appetite: { type: 'string' },
                                    sleepQuality: { type: 'string' },
                                    notes: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getCompletedAppointments() {
        return this.nursingService.getCompletedAppointments();
    }

    @Get('appointments/cancelled')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get cancelled nursing appointments',
        description: 'Retrieves a list of cancelled nursing appointments'
    })
    @ApiResponse({
        status: 200,
        description: 'Cancelled nursing appointments retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Cancelled nursing appointments retrieved successfully' },
                data: { type: 'array' }
            }
        }
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getCancelledAppointments() {
        return this.nursingService.getCancelledAppointments();
    }

    @Post('appointments')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Create a new nursing appointment',
        description: 'Creates a new nursing appointment for a patient'
    })
    @ApiResponse({
        status: 201,
        description: 'Appointment created successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointment created successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        appointmentDate: { type: 'string', format: 'date-time' },
                        appointmentType: { type: 'string', example: 'checkup' },
                        priority: { type: 'string', example: 'medium' },
                        status: { type: 'string', example: 'scheduled' },
                        notes: { type: 'string' },
                        durationMinutes: { type: 'number' },
                        patient: { type: 'object' },
                        staff: { type: 'object' },
                        area: { type: 'object' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Patient, staff member or area not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - appointment already exists for this date and time'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async createAppointment(@Body() createDto: CreateAppointmentDto) {
        return this.nursingService.createAppointment(createDto);
    }

    @Put('appointments/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Update/Reschedule a nursing appointment',
        description: 'Updates appointment details including date, time, type, priority, notes, and assigned staff. Use this to reschedule appointments.'
    })
    @ApiResponse({
        status: 200,
        description: 'Appointment updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointment updated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        appointmentDate: { type: 'string', format: 'date-time' },
                        appointmentType: { type: 'string' },
                        priority: { type: 'string' },
                        status: { type: 'string', example: 'rescheduled' },
                        notes: { type: 'string' },
                        patient: { type: 'object' },
                        staff: { type: 'object' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Appointment not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Cannot update completed or cancelled appointments, or conflict with existing appointments'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async updateAppointment(
        @Param('id') id: number,
        @Body() updateDto: UpdateAppointmentDto
    ) {
        return this.nursingService.updateAppointment(id, updateDto);
    }

    @Patch('appointments/:id/cancel')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Cancel a nursing appointment',
        description: 'Cancels a scheduled or in-progress appointment. Cannot cancel completed appointments.'
    })
    @ApiResponse({
        status: 200,
        description: 'Appointment cancelled successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointment cancelled successfully' },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        status: { type: 'string', example: 'cancelled' },
                        notes: { type: 'string' },
                        patient: { type: 'object' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Appointment not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Cannot cancel completed appointments'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async cancelAppointment(
        @Param('id') id: number,
        @Body() cancelDto: CancelAppointmentDto
    ) {
        return this.nursingService.cancelAppointment(id, cancelDto);
    }

    @Get('appointments/:id/records')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Get nursing records for a specific appointment',
        description: 'Retrieves all nursing records associated with a specific appointment, including patient vital signs and observations'
    })
    @ApiResponse({
        status: 200,
        description: 'Nursing records retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing records for appointment 1 retrieved successfully' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            date: { type: 'string', format: 'date-time' },
                            temperature: { type: 'number', example: 36.5 },
                            bloodPressure: { type: 'string', example: '120/80' },
                            heartRate: { type: 'number', example: 75 },
                            painLevel: { type: 'number', example: 2 },
                            mobility: { type: 'string', example: 'independent' },
                            appetite: { type: 'string', example: 'good' },
                            sleepQuality: { type: 'string', example: 'good' },
                            notes: { type: 'string', example: 'Patient in stable condition' },
                            createAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: 'Appointment not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Appointment does not belong to nursing area'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async getNursingRecordsByAppointment(@Param('id') id: string) {
        return this.nursingService.getNursingRecordsByAppointment(parseInt(id, 10));
    }

    @Post('appointments/:id/complete')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({ 
        summary: 'Complete a nursing appointment',
        description: 'Marks an appointment as completed and creates the nursing record with patient data collected during the appointment. This changes the appointment status to "completed" and stores vital signs and observations.'
    })
    @ApiResponse({
        status: 200,
        description: 'Appointment completed successfully and nursing record created',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Nursing appointment completed successfully' },
                data: {
                    type: 'object',
                    properties: {
                        appointment: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                status: { type: 'string', example: 'completed' },
                                appointmentDate: { type: 'string', format: 'date-time' },
                                patient: { type: 'object' },
                                staff: { type: 'object' }
                            }
                        },
                        nursingRecord: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                temperature: { type: 'number', example: 36.5 },
                                bloodPressure: { type: 'string', example: '120/80' },
                                heartRate: { type: 'number', example: 72 },
                                painLevel: { type: 'number', example: 2 },
                                mobility: { type: 'string', example: 'independent' },
                                appetite: { type: 'string', example: 'good' },
                                sleepQuality: { type: 'string', example: 'good' },
                                notes: { type: 'string' }
                            }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Appointment not found'
    })
    @ApiResponse({
        status: 409,
        description: 'Appointment already completed or cancelled, or appointment already has a nursing record'
    })
    @ApiResponse({
        status: 500,
        description: 'Internal server error'
    })
    async completeAppointment(
        @Param('id') id: number,
        @Body() completeDto: CompleteAppointmentDto
    ) {
        return this.nursingService.completeAppointment(id, completeDto);
    }
}
