import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import type { EncounterClass, EncounterType } from '../../domain/encounters';

export class CreateEncounterDto {
    @ApiProperty({ example: 1, description: 'ID del paciente adulto mayor' })
    @IsNotEmpty()
    @IsInt()
    idOlderAdult!: number;

    @ApiPropertyOptional({ example: 22, description: 'ID del profesional que atiende' })
    @IsOptional()
    @IsInt()
    idProfessional?: number;

    @ApiPropertyOptional({
        enum: ['ambulatory', 'inpatient', 'emergency', 'home_care'],
        default: 'inpatient',
        description: 'Clase de encuentro clínico (GNU Health)'
    })
    @IsOptional()
    @IsEnum(['ambulatory', 'inpatient', 'emergency', 'home_care'])
    encounterClass?: EncounterClass;

    @ApiProperty({
        enum: ['nursing', 'medical', 'physiotherapy', 'psychology', 'social_work', 'specialized'],
        example: 'nursing',
        description: 'Tipo de encuentro / especialidad'
    })
    @IsNotEmpty()
    @IsEnum(['nursing', 'medical', 'physiotherapy', 'psychology', 'social_work', 'specialized'])
    encounterType!: EncounterType;

    @ApiPropertyOptional({ example: '2026-10-14T10:00:00Z', description: 'Hora de inicio del encuentro' })
    @IsOptional()
    @IsDateString()
    startTime?: string;

    @ApiPropertyOptional({ example: 'Control matutino de rutina', description: 'Motivo principal de consulta' })
    @IsOptional()
    @IsString()
    chiefComplaint?: string;

    @ApiPropertyOptional({ example: 1, description: 'ID de cita previa vinculada si aplica' })
    @IsOptional()
    @IsInt()
    idAppointment?: number;
}
