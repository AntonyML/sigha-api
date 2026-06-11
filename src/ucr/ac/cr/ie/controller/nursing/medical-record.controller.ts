import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MedicalRecordService } from '../../services/nursing';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto, MedicalRecordFilterDto } from '../../dto/nursing';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Medical Records')
@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class MedicalRecordController {
    constructor(private readonly medicalRecordService: MedicalRecordService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({
        summary: 'Create a new medical record',
        description: 'Creates a new medical record for a patient. The optional id_staff / id_appointment fields link the record to a staff member and a specialized appointment.'
    })
    @ApiResponse({
        status: 201,
        description: 'Medical record created successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    @ApiResponse({
        status: 404,
        description: 'Older adult (patient) not found'
    })
    async createRecord(@Body() createDto: CreateMedicalRecordDto) {
        return this.medicalRecordService.createMedicalRecord(createDto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get medical records',
        description: 'Retrieve medical records, optionally filtered by older adult ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Records retrieved successfully'
    })
    @ApiQuery({
        name: 'olderAdultId',
        required: false,
        type: Number,
        description: 'Filter by older adult (patient) ID'
    })
    async getRecords(@Query() filter: MedicalRecordFilterDto) {
        return this.medicalRecordService.getMedicalRecords(filter.olderAdultId);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({
        summary: 'Get medical record by ID',
        description: 'Retrieve a specific medical record by its ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Medical record ID',
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'Record retrieved successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Record not found'
    })
    async getRecordById(@Param('id', ParseIntPipe) id: number) {
        return this.medicalRecordService.getMedicalRecordById(id);
    }

    @Put(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({
        summary: 'Update medical record',
        description: 'Update an existing medical record'
    })
    @ApiParam({
        name: 'id',
        description: 'Medical record ID',
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'Record updated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Record not found'
    })
    async updateRecord(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateMedicalRecordDto) {
        return this.medicalRecordService.updateMedicalRecord(id, updateDto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({
        summary: 'Delete medical record',
        description: 'Delete a medical record by ID'
    })
    @ApiParam({
        name: 'id',
        description: 'Medical record ID',
        type: Number
    })
    @ApiResponse({
        status: 200,
        description: 'Record deleted successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Record not found'
    })
    async deleteRecord(@Param('id', ParseIntPipe) id: number) {
        return this.medicalRecordService.deleteMedicalRecord(id);
    }
}