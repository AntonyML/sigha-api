import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsString,
    IsDateString,
    IsInt,
    MaxLength,
} from 'class-validator';
import { AdministrationStatus } from '../../domain/pharmacy';

export class RecordAdministrationDto {
    @ApiPropertyOptional({ description: 'ID del registro de administración existente a actualizar', example: 1 })
    @IsOptional()
    @IsInt()
    id?: number;

    @ApiPropertyOptional({ description: 'ID de la prescripción médica (si es administración ad-hoc/PRN)', example: 1 })
    @IsOptional()
    @IsInt()
    idPrescription?: number;

    @ApiPropertyOptional({ description: 'ID del adulto mayor (si es administración ad-hoc)', example: 1 })
    @IsOptional()
    @IsInt()
    idOlderAdult?: number;

    @ApiProperty({ enum: AdministrationStatus, example: AdministrationStatus.ADMINISTERED })
    @IsNotEmpty()
    @IsEnum(AdministrationStatus)
    status: AdministrationStatus;

    @ApiPropertyOptional({ description: 'Fecha y hora real de administración (ISO)', example: '2026-10-14T08:05:00Z' })
    @IsOptional()
    @IsDateString()
    administeredTime?: string;

    @ApiPropertyOptional({ description: 'Dosis real administrada', example: '1 tableta' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    doseGiven?: string;

    @ApiPropertyOptional({ description: 'Motivo si la dosis fue omitida o rechazada', example: 'Paciente en ayuno por exámenes de laboratorio' })
    @IsOptional()
    @IsString()
    omissionReason?: string;

    @ApiPropertyOptional({ description: 'Observaciones de enfermería durante la administración' })
    @IsOptional()
    @IsString()
    observations?: string;
}
