import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsString, IsIn, Min, Max } from 'class-validator';

export class CreatePhysiotherapyEvaluationDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 1, description: 'ID del encuentro clínico asociado' })
    @IsOptional()
    @IsInt()
    idEncounter?: number;

    @ApiProperty({ example: 22, description: 'ID del fisioterapeuta evaluador' })
    @IsNotEmpty()
    @IsInt()
    evaluatorId!: number;

    @ApiProperty({ example: 10, description: 'Alimentación (0, 5, 10)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10])
    barthelFeeding!: number;

    @ApiProperty({ example: 5, description: 'Baño / lavado (0, 5)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5])
    barthelBathing!: number;

    @ApiProperty({ example: 5, description: 'Vestido (0, 5)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5])
    barthelGrooming!: number;

    @ApiProperty({ example: 10, description: 'Arreglo personal (0, 5, 10)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10])
    barthelDressing!: number;

    @ApiProperty({ example: 10, description: 'Deposición / heces (0, 5, 10)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10])
    barthelBowels!: number;

    @ApiProperty({ example: 10, description: 'Micción / orina (0, 5, 10)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10])
    barthelBladder!: number;

    @ApiProperty({ example: 10, description: 'Uso del retrete (0, 5, 10)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10])
    barthelToiletUse!: number;

    @ApiProperty({ example: 15, description: 'Transferencias cama-sillón (0, 5, 10, 15)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10, 15])
    barthelTransfers!: number;

    @ApiProperty({ example: 15, description: 'Deambulación / movilidad (0, 5, 10, 15)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10, 15])
    barthelMobility!: number;

    @ApiProperty({ example: 10, description: 'Subir y bajar escaleras (0, 5, 10)' })
    @IsNotEmpty()
    @IsInt()
    @IsIn([0, 5, 10])
    barthelStairs!: number;

    @ApiPropertyOptional({ example: 11, description: 'Puntaje marcha Tinetti (0-12)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(12)
    tinettiGaitScore?: number;

    @ApiPropertyOptional({ example: 15, description: 'Puntaje equilibrio Tinetti (0-16)' })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(16)
    tinettiBalanceScore?: number;

    @ApiPropertyOptional({ example: 'Preservar autonomía en transferencias y deambulación', description: 'Metas terapéuticas' })
    @IsOptional()
    @IsString()
    rehabilitationGoals?: string;

    @ApiPropertyOptional({ example: '3 sesiones semanales: fortalecimiento de miembros inferiores y reeducación de la marcha', description: 'Plan de tratamiento' })
    @IsOptional()
    @IsString()
    treatmentPlan?: string;

    @ApiPropertyOptional({ example: 'Excelente colaboración durante la sesión', description: 'Notas adicionales' })
    @IsOptional()
    @IsString()
    notes?: string;
}
