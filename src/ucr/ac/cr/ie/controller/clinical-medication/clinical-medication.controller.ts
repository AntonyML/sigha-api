import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClinicalMedicationService } from '../../services/clinical-medication/clinical-medication.service';
import { CreateClinicalMedicationDto } from '../../dto/clinical-medication/create-clinical-medication.dto';
import { UpdateClinicalMedicationDto } from '../../dto/clinical-medication/update-clinical-medication.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Clinical Medication')
@Controller('clinical-medication')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class ClinicalMedicationController {
    constructor(private readonly clinicalMedicationService: ClinicalMedicationService) {}

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({ summary: 'Create a new clinical medication', description: 'Adds a new medication entry for a clinical history record' })
    @ApiResponse({ status: 201, description: 'Clinical medication created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 403, description: 'Insufficient permissions' })
    async create(@Body() dto: CreateClinicalMedicationDto) {
        return this.clinicalMedicationService.create(dto);
    }

    @Get()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get all clinical medications', description: 'Retrieves all medication entries, optionally filtered by clinical history ID' })
    @ApiQuery({ name: 'clinicalHistoryId', required: false, type: Number, description: 'Filter by clinical history ID' })
    @ApiResponse({ status: 200, description: 'Clinical medications retrieved successfully' })
    async findAll(@Query('clinicalHistoryId') clinicalHistoryId?: number) {
        if (clinicalHistoryId) {
            return this.clinicalMedicationService.findByClinicalHistory(+clinicalHistoryId);
        }
        return this.clinicalMedicationService.findAll();
    }

    @Get('by-clinical-history/:clinicalHistoryId')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get medications by clinical history', description: 'Retrieves all medications for a specific clinical history record' })
    @ApiResponse({ status: 200, description: 'Clinical medications retrieved successfully' })
    async findByClinicalHistory(@Param('clinicalHistoryId', ParseIntPipe) clinicalHistoryId: number) {
        return this.clinicalMedicationService.findByClinicalHistory(clinicalHistoryId);
    }

    @Get(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE, RoleType.PHYSIOTHERAPIST, RoleType.PSYCHOLOGIST, RoleType.SOCIAL_WORKER)
    @ApiOperation({ summary: 'Get a clinical medication by ID' })
    @ApiResponse({ status: 200, description: 'Clinical medication retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Clinical medication not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.clinicalMedicationService.findOne(id);
    }

    @Patch(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.NURSE)
    @ApiOperation({ summary: 'Update a clinical medication' })
    @ApiResponse({ status: 200, description: 'Clinical medication updated successfully' })
    @ApiResponse({ status: 404, description: 'Clinical medication not found' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClinicalMedicationDto) {
        return this.clinicalMedicationService.update(id, dto);
    }

    @Delete(':id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Delete a clinical medication' })
    @ApiResponse({ status: 200, description: 'Clinical medication deleted successfully' })
    @ApiResponse({ status: 404, description: 'Clinical medication not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.clinicalMedicationService.remove(id);
    }
}
