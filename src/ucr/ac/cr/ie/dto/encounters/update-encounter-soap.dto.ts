import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import type { EncounterStatus } from '../../domain/encounters';

export class UpdateEncounterSoapDto {
    @ApiPropertyOptional({
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        description: 'Estado de la atención clínica'
    })
    @IsOptional()
    @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])
    status?: EncounterStatus;

    @ApiPropertyOptional({ example: '2026-10-14T10:45:00Z', description: 'Hora de finalización' })
    @IsOptional()
    @IsDateString()
    endTime?: string;

    @ApiPropertyOptional({ example: 'Dolor en rodilla derecha al caminar', description: 'Subjetivo (S): Lo que refiere el paciente' })
    @IsOptional()
    @IsString()
    soSubjective?: string;

    @ApiPropertyOptional({ example: 'PA 120/80, sin crepitaciones, arcos conservados', description: 'Objetivo (O): Examen físico y signos medidos' })
    @IsOptional()
    @IsString()
    soObjective?: string;

    @ApiPropertyOptional({ example: 'Gonalgia leve secundaria a osteoartrosis M17.9', description: 'Evaluación (A): Juicio clínico y diagnóstico' })
    @IsOptional()
    @IsString()
    soAssessment?: string;

    @ApiPropertyOptional({ example: 'Ejercicios isométricos, calor local 15 min, control en 7 días', description: 'Plan (P): Tratamiento e indicaciones' })
    @IsOptional()
    @IsString()
    soPlan?: string;
}
