import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EncountersService } from '../../services/encounters';
import {
    CreateEncounterDto,
    UpdateEncounterSoapDto,
    SignEncounterDto,
    CreateNoteAddendumDto
} from '../../dto/encounters';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Clinical Encounters (Consultas y SOAP)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clinical-encounters')
export class EncountersController {
    constructor(private readonly encountersService: EncountersService) {}

    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo encuentro clínico estructurado' })
    @ApiResponse({ status: 201, description: 'Encuentro creado exitosamente' })
    async createEncounter(@Body() dto: CreateEncounterDto) {
        return this.encountersService.createEncounter(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle completo de un encuentro clínico (incluyendo notas SOAP y addendums)' })
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.encountersService.findById(id);
    }

    @Get('patient/:patientId')
    @ApiOperation({ summary: 'Listar historial de encuentros clínicos de un paciente' })
    async findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.encountersService.findByPatient(patientId);
    }

    @Patch(':id/soap')
    @ApiOperation({ summary: 'Actualizar notas SOAP del encuentro clínico (solo si no ha sido firmado)' })
    async updateSoap(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEncounterSoapDto
    ) {
        return this.encountersService.updateSoap(id, dto);
    }

    @Post(':id/sign')
    @ApiOperation({ summary: 'Firmar y cerrar definitivamente un encuentro clínico (inmutabilidad médica)' })
    async signEncounter(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SignEncounterDto
    ) {
        return this.encountersService.signEncounter(id, dto);
    }

    @Post(':id/addendums')
    @ApiOperation({ summary: 'Añadir un addendum (enmienda formal) a una nota clínica ya firmada' })
    async createAddendum(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateNoteAddendumDto
    ) {
        dto.idEncounter = id;
        return this.encountersService.createAddendum(dto);
    }
}
