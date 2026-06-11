import { IsEnum, IsOptional, IsInt, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialWorkVisitType } from '../../domain/nursing';
import { Type } from 'class-transformer';

export class CreateSocialWorkReportDto {
    @ApiPropertyOptional({
        description: 'Date and time of the social work report',
        example: '2025-02-08T10:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    sw_date?: string;

    @ApiProperty({
        description: 'Type of visit',
        enum: SocialWorkVisitType,
        example: SocialWorkVisitType.INTERVIEW,
    })
    @IsEnum(SocialWorkVisitType)
    sw_visit_type: SocialWorkVisitType;

    @ApiPropertyOptional({
        description: 'Family relationship assessment',
        example: 'Buena relación con hija que visita semanalmente',
    })
    @IsOptional()
    @IsString()
    sw_family_relationship?: string;

    @ApiPropertyOptional({
        description: 'Economic / financial assessment',
        example: 'Recibe pensión del régimen no contributivo',
    })
    @IsOptional()
    @IsString()
    sw_economic_assessment?: string;

    @ApiPropertyOptional({
        description: 'Social support network description',
        example: 'Apoyo de vecinos y centro diurno',
    })
    @IsOptional()
    @IsString()
    sw_social_support?: string;

    @ApiPropertyOptional({
        description: 'General observations of the visit',
        example: 'Adulto mayor colaborador',
    })
    @IsOptional()
    @IsString()
    sw_observations?: string;

    @ApiPropertyOptional({
        description: 'Recommendations from the social worker',
        example: 'Acercamiento a programa de cuido diurno',
    })
    @IsOptional()
    @IsString()
    sw_recommendations?: string;

    @ApiProperty({
        description: 'ID of the specialized appointment (FK to specialized_appointment)',
        example: 1,
    })
    @IsInt()
    @Type(() => Number)
    id_appointment: number;
}

export class UpdateSocialWorkReportDto {
    @ApiPropertyOptional({
        description: 'Date and time of the social work report',
        example: '2025-02-08T10:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    sw_date?: string;

    @ApiPropertyOptional({
        description: 'Type of visit',
        enum: SocialWorkVisitType,
    })
    @IsOptional()
    @IsEnum(SocialWorkVisitType)
    sw_visit_type?: SocialWorkVisitType;

    @ApiPropertyOptional({ description: 'Family relationship assessment' })
    @IsOptional()
    @IsString()
    sw_family_relationship?: string;

    @ApiPropertyOptional({ description: 'Economic / financial assessment' })
    @IsOptional()
    @IsString()
    sw_economic_assessment?: string;

    @ApiPropertyOptional({ description: 'Social support network description' })
    @IsOptional()
    @IsString()
    sw_social_support?: string;

    @ApiPropertyOptional({ description: 'General observations of the visit' })
    @IsOptional()
    @IsString()
    sw_observations?: string;

    @ApiPropertyOptional({ description: 'Recommendations from the social worker' })
    @IsOptional()
    @IsString()
    sw_recommendations?: string;

    @ApiPropertyOptional({
        description: 'ID of the specialized appointment',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    id_appointment?: number;
}

export class SocialWorkReportFilterDto {
    @ApiPropertyOptional({
        description: 'Filter by appointment ID',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    appointmentId?: number;
}
