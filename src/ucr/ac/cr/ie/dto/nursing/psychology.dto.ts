import { IsEnum, IsOptional, IsInt, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PsychologySessionType, Mood, CognitiveStatus } from '../../domain/nursing';
import { Type } from 'class-transformer';

export class CreatePsychologySessionDto {
    @ApiProperty({
        description: 'Date and time of the psychology session',
        example: '2025-02-08T10:00:00.000Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    psy_date?: string;

    @ApiProperty({
        description: 'Type of psychology session',
        enum: PsychologySessionType,
        example: PsychologySessionType.THERAPY
    })
    @IsEnum(PsychologySessionType)
    psy_session_type: PsychologySessionType;

    @ApiProperty({
        description: 'Patient mood during session',
        enum: Mood,
        example: Mood.STABLE
    })
    @IsEnum(Mood)
    psy_mood: Mood;

    @ApiProperty({
        description: 'Cognitive status of the patient',
        enum: CognitiveStatus,
        example: CognitiveStatus.NORMAL
    })
    @IsEnum(CognitiveStatus)
    psy_cognitive_status: CognitiveStatus;

    @ApiPropertyOptional({
        description: 'Session observations',
        example: 'Patient showed good engagement during therapy'
    })
    @IsOptional()
    @IsString()
    psy_observations?: string;

    @ApiPropertyOptional({
        description: 'Therapy goals for the session',
        example: 'Improve emotional regulation and social skills'
    })
    @IsOptional()
    @IsString()
    psy_therapy_goal?: string;

    @ApiPropertyOptional({
        description: 'Progress notes',
        example: 'Patient made significant progress in managing anxiety'
    })
    @IsOptional()
    @IsString()
    psy_progress?: string;

    @ApiProperty({
        description: 'ID of the specialized appointment',
        example: 1
    })
    @IsInt()
    @Type(() => Number)
    id_appointment: number;
}

export class UpdatePsychologySessionDto {
    @ApiPropertyOptional({
        description: 'Date and time of the psychology session',
        example: '2025-02-08T10:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    psy_date?: string;

    @ApiPropertyOptional({
        description: 'Type of psychology session',
        enum: PsychologySessionType,
        example: PsychologySessionType.FOLLOW_UP
    })
    @IsOptional()
    @IsEnum(PsychologySessionType)
    psy_session_type?: PsychologySessionType;

    @ApiPropertyOptional({
        description: 'Patient mood during session',
        enum: Mood,
        example: Mood.ANXIOUS
    })
    @IsOptional()
    @IsEnum(Mood)
    psy_mood?: Mood;

    @ApiPropertyOptional({
        description: 'Cognitive status of the patient',
        enum: CognitiveStatus,
        example: CognitiveStatus.MILD_IMPAIRMENT
    })
    @IsOptional()
    @IsEnum(CognitiveStatus)
    psy_cognitive_status?: CognitiveStatus;

    @ApiPropertyOptional({
        description: 'Session observations',
        example: 'Updated observations based on patient feedback'
    })
    @IsOptional()
    @IsString()
    psy_observations?: string;

    @ApiPropertyOptional({
        description: 'Therapy goals for the session',
        example: 'Adjust goals based on current progress'
    })
    @IsOptional()
    @IsString()
    psy_therapy_goal?: string;

    @ApiPropertyOptional({
        description: 'Progress notes',
        example: 'Continued improvement in cognitive functions'
    })
    @IsOptional()
    @IsString()
    psy_progress?: string;
}

export class PsychologySessionFilterDto {
    @ApiPropertyOptional({
        description: 'Filter by appointment ID',
        example: 1
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    appointmentId?: number;
}