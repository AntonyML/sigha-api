import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SpecializedAppointmentsService } from '../../services/specialized-appointments/specialized-appointments.service';
import { CreateSpecializedAppointmentDto } from '../../dto/specialized-appointments/create-specialized-appointment.dto';
import { UpdateSpecializedAppointmentDto } from '../../dto/specialized-appointments/update-specialized-appointment.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';
import { AppointmentStatus } from '../../domain/nursing';

@ApiTags('Specialized Appointments')
@Controller('specialized-appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class SpecializedAppointmentsController {
    constructor(private readonly specializedAppointmentsService: SpecializedAppointmentsService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Create a specialized appointment', description: 'Schedules a new specialized appointment for an older adult' })
    @ApiResponse({ status: 201, description: 'Specialized appointment created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    async create(@Body() dto: CreateSpecializedAppointmentDto) {
        return this.specializedAppointmentsService.create(dto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get all specialized appointments', description: 'Retrieves all specialized appointments with optional filters' })
    @ApiQuery({ name: 'patientId', required: false, type: Number, description: 'Filter by patient (older adult) ID' })
    @ApiQuery({ name: 'areaId', required: false, type: Number, description: 'Filter by specialized area ID' })
    @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus, description: 'Filter by appointment status' })
    @ApiResponse({ status: 200, description: 'Specialized appointments retrieved successfully' })
    async findAll(
        @Query('patientId') patientId?: number,
        @Query('areaId') areaId?: number,
        @Query('status') status?: AppointmentStatus
    ) {
        return this.specializedAppointmentsService.findAll(
            patientId ? +patientId : undefined,
            areaId ? +areaId : undefined,
            status
        );
    }

    @Get('by-patient/:patientId')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get appointments for a specific patient', description: 'Retrieves all specialized appointments for a given older adult' })
    @ApiResponse({ status: 200, description: 'Patient appointments retrieved successfully' })
    async findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.specializedAppointmentsService.findByPatient(patientId);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get a specialized appointment by ID' })
    @ApiResponse({ status: 200, description: 'Specialized appointment retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Specialized appointment not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.specializedAppointmentsService.findOne(id);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Update a specialized appointment' })
    @ApiResponse({ status: 200, description: 'Specialized appointment updated successfully' })
    @ApiResponse({ status: 404, description: 'Specialized appointment not found' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSpecializedAppointmentDto) {
        return this.specializedAppointmentsService.update(id, dto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Delete a specialized appointment' })
    @ApiResponse({ status: 200, description: 'Specialized appointment deleted successfully' })
    @ApiResponse({ status: 404, description: 'Specialized appointment not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.specializedAppointmentsService.remove(id);
    }
}
