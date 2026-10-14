import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NursingRoundsService } from '../../services/encounters';
import { CreateNursingRoundDto } from '../../dto/encounters';
import { NursingShift } from '../../domain/encounters';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Nursing Rounds (Rondas de Sala por Turno)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nursing-rounds')
export class NursingRoundsController {
    constructor(private readonly nursingRoundsService: NursingRoundsService) {}

    @Post()
    @ApiOperation({ summary: 'Registrar ronda de enfermería de sala' })
    @ApiResponse({ status: 201, description: 'Ronda registrada exitosamente' })
    async recordRound(@Body() dto: CreateNursingRoundDto) {
        return this.nursingRoundsService.recordRound(dto);
    }

    @Get('patient/:patientId')
    @ApiOperation({ summary: 'Listar historial de rondas de enfermería de un residente' })
    async findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
        return this.nursingRoundsService.findByPatient(patientId);
    }

    @Get('date/:date')
    @ApiOperation({ summary: 'Listar rondas de enfermería realizadas en una fecha específica' })
    @ApiQuery({ name: 'shift', required: false, enum: ['morning', 'afternoon', 'night'] })
    async findByDateAndShift(
        @Param('date') date: string,
        @Query('shift') shift?: NursingShift
    ) {
        return this.nursingRoundsService.findByDateAndShift(date, shift);
    }
}
