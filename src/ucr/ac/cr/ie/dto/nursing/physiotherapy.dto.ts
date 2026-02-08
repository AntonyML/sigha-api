import { IsEnum, IsOptional, IsInt, IsString, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhysiotherapyType, MobilityLevel } from '../../domain/nursing';
import { Type } from 'class-transformer';

export class CreatePhysiotherapySessionDto {
    @ApiProperty({
        description: 'Date and time of the physiotherapy session',
        example: '2025-02-08T10:00:00.000Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    ps_date?: string;

    @ApiProperty({
        description: 'Type of physiotherapy session',
        enum: PhysiotherapyType,
        example: PhysiotherapyType.THERAPY
    })
    @IsEnum(PhysiotherapyType)
    ps_type: PhysiotherapyType;

    @ApiProperty({
        description: 'Mobility level of the patient',
        enum: MobilityLevel,
        example: MobilityLevel.MODERATE
    })
    @IsEnum(MobilityLevel)
    ps_mobility_level: MobilityLevel;

    @ApiPropertyOptional({
        description: 'Pain level (0-10 scale)',
        example: 5,
        minimum: 0,
        maximum: 10
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    ps_pain_level?: number;

    @ApiPropertyOptional({
        description: 'Treatment description',
        example: 'Patient showed improvement in mobility'
    })
    @IsOptional()
    @IsString()
    ps_treatment_description?: string;

    @ApiPropertyOptional({
        description: 'Exercise plan prescribed',
        example: 'Daily stretching exercises for 15 minutes'
    })
    @IsOptional()
    @IsString()
    ps_exercise_plan?: string;

    @ApiPropertyOptional({
        description: 'Progress notes',
        example: 'Patient completed all exercises successfully'
    })
    @IsOptional()
    @IsString()
    ps_progress_notes?: string;

    @ApiProperty({
        description: 'ID of the specialized appointment',
        example: 1
    })
    @IsInt()
    @Type(() => Number)
    id_appointment: number;
}

export class UpdatePhysiotherapySessionDto {
    @ApiPropertyOptional({
        description: 'Date and time of the physiotherapy session',
        example: '2025-02-08T10:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    ps_date?: string;

    @ApiPropertyOptional({
        description: 'Type of physiotherapy session',
        enum: PhysiotherapyType,
        example: PhysiotherapyType.FOLLOW_UP
    })
    @IsOptional()
    @IsEnum(PhysiotherapyType)
    ps_type?: PhysiotherapyType;

    @ApiPropertyOptional({
        description: 'Mobility level of the patient',
        enum: MobilityLevel,
        example: MobilityLevel.HIGH
    })
    @IsOptional()
    @IsEnum(MobilityLevel)
    ps_mobility_level?: MobilityLevel;

    @ApiPropertyOptional({
        description: 'Pain level (0-10 scale)',
        example: 3,
        minimum: 0,
        maximum: 10
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    ps_pain_level?: number;

    @ApiPropertyOptional({
        description: 'Treatment description',
        example: 'Updated treatment plan based on progress'
    })
    @IsOptional()
    @IsString()
    ps_treatment_description?: string;

    @ApiPropertyOptional({
        description: 'Exercise plan prescribed',
        example: 'Increased exercise duration to 20 minutes'
    })
    @IsOptional()
    @IsString()
    ps_exercise_plan?: string;

    @ApiPropertyOptional({
        description: 'Progress notes',
        example: 'Significant improvement observed'
    })
    @IsOptional()
    @IsString()
    ps_progress_notes?: string;
}

export class PhysiotherapySessionFilterDto {
    @ApiPropertyOptional({
        description: 'Filter by appointment ID',
        example: 1
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    appointmentId?: number;
}