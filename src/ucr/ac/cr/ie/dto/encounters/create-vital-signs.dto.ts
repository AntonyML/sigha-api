import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';

export class CreateVitalSignsDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del encuentro clínico asociado si aplica' })
    @IsOptional()
    @IsInt()
    idEncounter?: number;

    @ApiPropertyOptional({ example: 120, description: 'Presión arterial sistólica (mmHg, 40-300)' })
    @IsOptional()
    @IsInt()
    @Min(40)
    @Max(300)
    systolicBp?: number;

    @ApiPropertyOptional({ example: 80, description: 'Presión arterial diastólica (mmHg, 20-200)' })
    @IsOptional()
    @IsInt()
    @Min(20)
    @Max(200)
    diastolicBp?: number;

    @ApiPropertyOptional({ example: 72, description: 'Frecuencia cardíaca (lpm, 20-250)' })
    @IsOptional()
    @IsInt()
    @Min(20)
    @Max(250)
    heartRate?: number;

    @ApiPropertyOptional({ example: 16, description: 'Frecuencia respiratoria (rpm, 5-60)' })
    @IsOptional()
    @IsInt()
    @Min(5)
    @Max(60)
    respiratoryRate?: number;

    @ApiPropertyOptional({ example: 36.6, description: 'Temperatura corporal (°C, 30.0-45.0)' })
    @IsOptional()
    @IsNumber()
    @Min(30.0)
    @Max(45.0)
    temperature?: number;

    @ApiPropertyOptional({ example: 98, description: 'Saturación de oxígeno (% SpO2, 50-100)' })
    @IsOptional()
    @IsInt()
    @Min(50)
    @Max(100)
    spo2?: number;

    @ApiPropertyOptional({ example: 105.5, description: 'Glicemia capilar (mg/dL, 10.0-800.0)' })
    @IsOptional()
    @IsNumber()
    @Min(10.0)
    @Max(800.0)
    glycemia?: number;

    @ApiPropertyOptional({ example: 3, description: 'Dolor en escala visual análoga (EVA, 0-10)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    painEva?: number;

    @ApiPropertyOptional({ example: 68.5, description: 'Peso corporal en kg' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(399)
    weightKg?: number;

    @ApiPropertyOptional({ example: 165.0, description: 'Estatura en cm' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(250)
    heightCm?: number;

    @ApiPropertyOptional({ example: 'Medido en reposo de 10 min', description: 'Observaciones' })
    @IsOptional()
    @IsString()
    notes?: string;

}
