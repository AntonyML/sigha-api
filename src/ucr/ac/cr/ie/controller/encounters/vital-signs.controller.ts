import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VitalSignsService } from '../../services/encounters';
import { CreateVitalSignsDto } from '../../dto/encounters';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Clinical Vital Signs (Signos Vitales Numéricos)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vital-signs')
export class VitalSignsController {
    constructor(private readonly vitalSignsService: VitalSignsService) {}

    @Post()
    @ApiOperation({ summary: 'Registrar toma de signos vitales numéricos' })
    @ApiResponse({ status: 201, description: 'Signos vitales registrados exitosamente' })
    async recordVitalSigns(@Body() dto: CreateVitalSignsDto, @Req() request: any) {
        const recordedBy = Number(request.user?.userId ?? request.user?.id);
        if (!Number.isSafeInteger(recordedBy) || recordedBy <= 0) {
            throw new UnauthorizedException('No se encontró el profesional autenticado');
        }
        return this.vitalSignsService.recordVitalSigns(dto, recordedBy);
    }

    @Get('patient/:patientId')
    @ApiOperation({ summary: 'Listar historial de signos vitales de un paciente' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async findByPatient(
        @Param('patientId', ParseIntPipe) patientId: number,
        @Query('limit') limit?: string
    ) {
        return this.vitalSignsService.findByPatient(patientId, limit ? parseInt(limit, 10) : 50);
    }

    @Get('patient/:patientId/latest')
    @ApiOperation({ summary: 'Obtener última toma de signos vitales registrada para un paciente' })
    async getLatestByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.vitalSignsService.getLatestByPatient(patientId);
    }

    @Get('encounter/:encounterId')
    @ApiOperation({ summary: 'Listar signos vitales tomados dentro de un encuentro clínico' })
    async findByEncounter(@Param('encounterId', ParseIntPipe) encounterId: number) {
        return this.vitalSignsService.findByEncounter(encounterId);
    }
}
