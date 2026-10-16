import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { ClinicalConditionsService } from '../../services/clinical-conditions/clinical-conditions.service';
import {
    CreateClinicalConditionDto,
    CreatePatientConditionDto,
    UpdatePatientConditionDto,
    Icd10QueryDto,
} from '../../dto/clinical-conditions';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';
import { ConditionStatus } from '../../domain/clinical-conditions';

@ApiTags('Clinical Conditions')
@Controller('clinical-conditions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class ClinicalConditionsController {
    constructor(private readonly clinicalConditionsService: ClinicalConditionsService) {}

    // ==========================================
    // 1. Catálogo Legacy
    // ==========================================

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Crear condición en catálogo legado' })
    @ApiResponse({ status: 201, description: 'Condición creada exitosamente' })
    async createClinicalCondition(@Body() createClinicalConditionDto: CreateClinicalConditionDto) {
        return this.clinicalConditionsService.createClinicalCondition(createClinicalConditionDto);
    }

    @Get()
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Obtener todas las condiciones del catálogo legado' })
    async getAllClinicalConditions() {
        return this.clinicalConditionsService.getAllClinicalConditions();
    }

    // ==========================================
    // 2. Catálogo Oficial CIE-10 (ICD-10)
    // ==========================================

    @Get('icd10')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Buscar patologías en el catálogo estándar CIE-10 (ICD-10)' })
    @ApiQuery({ name: 'search', required: false, description: 'Buscar por código o descripción' })
    @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoría' })
    async searchIcd10(@Query() query: Icd10QueryDto) {
        return this.clinicalConditionsService.searchIcd10(query);
    }

    // ==========================================
    // 3. Condiciones y Diagnósticos del Paciente
    // ==========================================

    @Post('patient-conditions')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Registrar patología / diagnóstico en el historial del residente' })
    @ApiResponse({ status: 201, description: 'Condición registrada exitosamente' })
    async createPatientCondition(@Body() dto: CreatePatientConditionDto) {
        return this.clinicalConditionsService.createPatientCondition(dto);
    }

    @Get('patient-conditions/by-resident/:residentId')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Listar diagnósticos y patologías activas de un residente' })
    @ApiParam({ name: 'residentId', type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ConditionStatus })
    async getConditionsByResident(
        @Param('residentId', ParseIntPipe) residentId: number,
        @Query('status') status?: ConditionStatus
    ) {
        return this.clinicalConditionsService.getConditionsByResident(residentId, status);
    }

    @Patch('patient-conditions/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Actualizar estado o notas de la condición de un paciente' })
    @ApiParam({ name: 'id', type: Number })
    async updatePatientCondition(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePatientConditionDto
    ) {
        return this.clinicalConditionsService.updatePatientCondition(id, dto);
    }
}