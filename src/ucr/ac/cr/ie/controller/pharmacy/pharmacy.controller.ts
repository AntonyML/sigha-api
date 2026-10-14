import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
    Req,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { PharmacyService } from '../../services/pharmacy/pharmacy.service';
import {
    CreateMedicationCatalogDto,
    UpdateMedicationCatalogDto,
    CreateMedicationPrescriptionDto,
    UpdateMedicationPrescriptionDto,
} from '../../dto/pharmacy';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';
import { PrescriptionStatus } from '../../domain/pharmacy';

@ApiTags('Pharmacy')
@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class PharmacyController {
    constructor(private readonly pharmacyService: PharmacyService) {}

    // ==========================================
    // Vademécum / Catálogo
    // ==========================================

    @Post('medications')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Agregar medicamento al vademécum' })
    @ApiResponse({ status: 201, description: 'Medicamento agregado exitosamente' })
    async createMedication(@Body() dto: CreateMedicationCatalogDto) {
        return this.pharmacyService.createMedication(dto);
    }

    @Get('medications')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Listar medicamentos del vademécum' })
    @ApiQuery({ name: 'search', required: false, description: 'Búsqueda por nombre o principio activo' })
    @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Filtrar solo activos (default true)' })
    async findAllMedications(
        @Query('search') search?: string,
        @Query('activeOnly') activeOnly?: string
    ) {
        const isActive = activeOnly !== undefined ? activeOnly === 'true' : true;
        return this.pharmacyService.findAllMedications(search, isActive);
    }

    @Get('medications/:id')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Obtener detalle de un medicamento del vademécum' })
    @ApiParam({ name: 'id', type: Number })
    async findMedicationById(@Param('id', ParseIntPipe) id: number) {
        return this.pharmacyService.findMedicationById(id);
    }

    @Patch('medications/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Actualizar medicamento del vademécum' })
    @ApiParam({ name: 'id', type: Number })
    async updateMedication(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMedicationCatalogDto
    ) {
        return this.pharmacyService.updateMedication(id, dto);
    }

    // ==========================================
    // Prescripciones Médicas
    // ==========================================

    @Post('prescriptions')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Crear una orden/prescripción médica' })
    @ApiResponse({ status: 201, description: 'Prescripción creada exitosamente' })
    async createPrescription(@Body() dto: CreateMedicationPrescriptionDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.pharmacyService.createPrescription(dto, userId);
    }

    @Get('prescriptions/by-resident/:residentId')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Listar prescripciones de un residente' })
    @ApiParam({ name: 'residentId', type: Number })
    @ApiQuery({ name: 'status', required: false, enum: PrescriptionStatus })
    async findPrescriptionsByResident(
        @Param('residentId', ParseIntPipe) residentId: number,
        @Query('status') status?: PrescriptionStatus
    ) {
        return this.pharmacyService.findPrescriptionsByResident(residentId, status);
    }

    @Get('prescriptions/:id')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Obtener detalle de una prescripción' })
    @ApiParam({ name: 'id', type: Number })
    async findPrescriptionById(@Param('id', ParseIntPipe) id: number) {
        return this.pharmacyService.findPrescriptionById(id);
    }

    @Patch('prescriptions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Actualizar prescripción médica' })
    @ApiParam({ name: 'id', type: Number })
    async updatePrescription(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMedicationPrescriptionDto
    ) {
        return this.pharmacyService.updatePrescription(id, dto);
    }

    @Delete('prescriptions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR)
    @ApiOperation({ summary: 'Cancelar/descontinuar prescripción médica' })
    @ApiParam({ name: 'id', type: Number })
    async cancelPrescription(@Param('id', ParseIntPipe) id: number) {
        return this.pharmacyService.cancelPrescription(id);
    }
}
