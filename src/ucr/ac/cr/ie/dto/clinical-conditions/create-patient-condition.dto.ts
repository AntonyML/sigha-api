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
import { ConditionStatus, ConditionSeverity } from '../../domain/clinical-conditions';

export class CreatePatientConditionDto {
    @ApiProperty({ description: 'ID del adulto mayor (residente)', example: 1 })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult: number;

    @ApiPropertyOptional({ description: 'ID de la patología en el catálogo CIE-10', example: 1 })
    @IsOptional()
    @IsInt()
    idIcd10?: number;

    @ApiPropertyOptional({ description: 'Diagnóstico personalizado o especificación clínica', example: 'Hipertensión refractaria' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    customDiagnosisName?: string;

    @ApiPropertyOptional({ enum: ConditionStatus, default: ConditionStatus.ACTIVE })
    @IsOptional()
    @IsEnum(ConditionStatus)
    status?: ConditionStatus;

    @ApiPropertyOptional({ enum: ConditionSeverity, default: ConditionSeverity.MODERATE })
    @IsOptional()
    @IsEnum(ConditionSeverity)
    severity?: ConditionSeverity;

    @ApiPropertyOptional({ description: 'Fecha de inicio o diagnóstico (YYYY-MM-DD)', example: '2026-01-15' })
    @IsOptional()
    @IsDateString()
    onsetDate?: string;

    @ApiPropertyOptional({ description: 'Fecha de resolución (si aplica)', example: '2026-06-30' })
    @IsOptional()
    @IsDateString()
    resolvedDate?: string;

    @ApiPropertyOptional({ description: 'Notas clínicas o evolución del diagnóstico' })
    @IsOptional()
    @IsString()
    notes?: string;
}
