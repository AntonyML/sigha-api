import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    IsOptional,
    IsString,
    IsEnum,
    IsBoolean,
    IsDateString,
    MaxLength,
} from 'class-validator';
import { AdministrationRoute } from '../../domain/pharmacy';
import { TreatmentType } from '../../domain/virtual-records/clinical-medication.entity';

export class CreateMedicationPrescriptionDto {
    @ApiProperty({ description: 'ID del adulto mayor (residente)', example: 1 })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult: number;

    @ApiPropertyOptional({ description: 'ID del medicamento en el catálogo/vademécum', example: 1 })
    @IsOptional()
    @IsInt()
    idMedication?: number;

    @ApiPropertyOptional({ description: 'Nombre personalizado si no está en catálogo', example: 'Fórmula magistral X' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    customMedicationName?: string;

    @ApiProperty({ description: 'Dosis prescrita', example: '1 tableta' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    dosage: string;

    @ApiPropertyOptional({ enum: AdministrationRoute, default: AdministrationRoute.ORAL })
    @IsOptional()
    @IsEnum(AdministrationRoute)
    route?: AdministrationRoute;

    @ApiPropertyOptional({ description: 'Frecuencia en horas entre dosis (ej. 8, 12, 24)', example: 12 })
    @IsOptional()
    @IsInt()
    frequencyHours?: number;

    @ApiPropertyOptional({ description: 'Horario específico o indicación temporal', example: '08:00, 20:00 con alimentos' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    specificSchedule?: string;

    @ApiPropertyOptional({ enum: TreatmentType, default: TreatmentType.CHRONIC })
    @IsOptional()
    @IsEnum(TreatmentType)
    treatmentType?: TreatmentType;

    @ApiProperty({ description: 'Fecha de inicio del tratamiento (YYYY-MM-DD)', example: '2026-10-14' })
    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @ApiPropertyOptional({ description: 'Fecha de finalización (opcional para tratamientos crónicos)', example: '2026-11-14' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ description: 'Indicaciones médicas especiales o advertencias' })
    @IsOptional()
    @IsString()
    instructions?: string;

    @ApiPropertyOptional({ description: 'Indica si es medicación SOS / según sea necesario (PRN)', default: false })
    @IsOptional()
    @IsBoolean()
    isPrn?: boolean;
}
