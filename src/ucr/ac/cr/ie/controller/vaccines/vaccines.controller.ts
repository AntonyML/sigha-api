import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { VaccinesService } from '../../services/vaccines/vaccines.service';
import {
    CreateVaccineDto,
    CreatePatientVaccinationDto,
    UpdatePatientVaccinationDto,
} from '../../dto/vaccines';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Vaccines')
@Controller('vaccines')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('jwt')
export class VaccinesController {
    constructor(private readonly vaccinesService: VaccinesService) {}

    // ==========================================
    // 1. Catálogo Base
    // ==========================================

    @Post()
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
    @ApiOperation({ summary: 'Crear vacuna en catálogo base' })
    @ApiResponse({ status: 201, description: 'Vacuna creada exitosamente' })
    async createVaccine(@Body() createVaccineDto: CreateVaccineDto) {
        return this.vaccinesService.createVaccine(createVaccineDto);
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
    @ApiOperation({ summary: 'Obtener todas las vacunas del catálogo' })
    async getAllVaccines() {
        return this.vaccinesService.getAllVaccines();
    }

    // ==========================================
    // 2. Registro de Inmunizaciones
    // ==========================================

    @Post('patient-vaccinations')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Registrar aplicación de vacuna en el expediente del residente' })
    @ApiResponse({ status: 201, description: 'Registro de vacunación guardado exitosamente' })
    async createPatientVaccination(@Body() dto: CreatePatientVaccinationDto) {
        return this.vaccinesService.createPatientVaccination(dto);
    }

    @Get('patient-vaccinations/by-resident/:residentId')
    @Roles(
        RoleType.SUPER_ADMIN,
        RoleType.ADMIN,
        RoleType.DIRECTOR,
        RoleType.NURSE,
        RoleType.PHYSIOTHERAPIST,
        RoleType.PSYCHOLOGIST,
        RoleType.SOCIAL_WORKER
    )
    @ApiOperation({ summary: 'Obtener cartilla de vacunación histórica de un residente' })
    @ApiParam({ name: 'residentId', type: Number })
    async getVaccinationsByResident(@Param('residentId', ParseIntPipe) residentId: number) {
        return this.vaccinesService.getVaccinationsByResident(residentId);
    }

    @Patch('patient-vaccinations/:id')
    @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN, RoleType.DIRECTOR, RoleType.NURSE)
    @ApiOperation({ summary: 'Actualizar registro de vacunación' })
    @ApiParam({ name: 'id', type: Number })
    async updatePatientVaccination(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePatientVaccinationDto
    ) {
        return this.vaccinesService.updatePatientVaccination(id, dto);
    }
}