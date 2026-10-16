import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import type { NursingShift } from '../../domain/encounters';

export class CreateNursingRoundDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: '2026-10-14', description: 'Fecha de la ronda (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    roundDate?: string;

    @ApiProperty({
        enum: ['morning', 'afternoon', 'night'],
        example: 'morning',
        description: 'Turno de la ronda'
    })
    @IsNotEmpty()
    @IsEnum(['morning', 'afternoon', 'night'])
    shift!: NursingShift;

    @ApiPropertyOptional({ example: 1, description: 'ID del registro de signos vitales tomado en la ronda' })
    @IsOptional()
    @IsInt()
    idVitalSigns?: number;

    @ApiPropertyOptional({ example: 'Residente lúcido, comunicativo y colaborador', description: 'Estado general' })
    @IsOptional()
    @IsString()
    generalCondition?: string;

    @ApiPropertyOptional({ example: 'Piel hidratada, sin eritemas ni lesiones por presión (Braden 19)', description: 'Integridad cutánea y prevención UPP' })
    @IsOptional()
    @IsString()
    skinIntegrity?: string;

    @ApiPropertyOptional({ example: 'Toleró dieta blanda completa e ingesta hídrica adecuada', description: 'Nutrición e hidratación' })
    @IsOptional()
    @IsString()
    nutritionHydration?: string;

    @ApiPropertyOptional({ example: 'Diuresis espontánea presente, sin catéter', description: 'Eliminación vesical e intestinal' })
    @IsOptional()
    @IsString()
    elimination?: string;

    @ApiPropertyOptional({ example: 'Deambuló en pasillo con supervisión y andadera', description: 'Movilidad y confort' })
    @IsOptional()
    @IsString()
    mobilityComfort?: string;

    @ApiPropertyOptional({ example: 'medium', description: 'Riesgo de caídas (low, medium, high)', default: 'medium' })
    @IsOptional()
    @IsString()
    fallRisk?: string;

    @ApiPropertyOptional({ example: 'Sin eventualidades durante el turno', description: 'Observaciones generales' })
    @IsOptional()
    @IsString()
    notes?: string;
}
