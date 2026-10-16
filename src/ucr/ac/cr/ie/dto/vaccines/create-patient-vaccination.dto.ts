import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    MaxLength,
} from 'class-validator';
import { VaccineDose } from '../../domain/vaccines';

export class CreatePatientVaccinationDto {
    @ApiProperty({ description: 'ID del adulto mayor (residente)', example: 1 })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult: number;

    @ApiPropertyOptional({ description: 'ID de la vacuna en el catálogo base', example: 1 })
    @IsOptional()
    @IsInt()
    idVaccine?: number;

    @ApiPropertyOptional({ description: 'Nombre personalizado de la vacuna si no está en catálogo', example: 'Vacuna específica X' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    customVaccineName?: string;

    @ApiPropertyOptional({ enum: VaccineDose, default: VaccineDose.SINGLE })
    @IsOptional()
    @IsEnum(VaccineDose)
    dose?: VaccineDose;

    @ApiProperty({ description: 'Fecha de aplicación (YYYY-MM-DD)', example: '2026-10-14' })
    @IsNotEmpty()
    @IsDateString()
    applicationDate: string;

    @ApiPropertyOptional({ description: 'Número de lote del biológico', example: 'LOT-2026-AB' })
    @IsOptional()
    @IsString()
    @MaxLength(60)
    lotNumber?: string;

    @ApiPropertyOptional({ description: 'Fecha de vencimiento del lote', example: '2027-05-30' })
    @IsOptional()
    @IsDateString()
    expirationDate?: string;

    @ApiPropertyOptional({ description: 'Profesional o institución que aplicó la vacuna', example: 'EBAIS San Pedro' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    appliedBy?: string;

    @ApiPropertyOptional({ description: 'Reacciones adversas observadas post-vacunación' })
    @IsOptional()
    @IsString()
    adverseReactions?: string;

    @ApiPropertyOptional({ description: 'Fecha sugerida para el próximo refuerzo', example: '2027-10-14' })
    @IsOptional()
    @IsDateString()
    nextBoosterDate?: string;

    @ApiPropertyOptional({ description: 'Observaciones generales' })
    @IsOptional()
    @IsString()
    observations?: string;
}
