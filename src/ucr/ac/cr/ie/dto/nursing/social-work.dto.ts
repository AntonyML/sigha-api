import { IsEnum, IsOptional, IsInt, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialWorkReportType, SupportLevel, LivingArrangement } from '../../domain/nursing';
import { Type } from 'class-transformer';

export class CreateSocialWorkReportDto {
    @ApiProperty({
        description: 'ID of the patient (older adult)',
        example: 1
    })
    @IsNumber()
    patient_id: number;

    @ApiPropertyOptional({
        description: 'Date and time of the social work report',
        example: '2025-02-08T10:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    report_date?: string;

    @ApiProperty({
        description: 'Type of social work report',
        enum: SocialWorkReportType,
        example: SocialWorkReportType.INITIAL_ASSESSMENT
    })
    @IsEnum(SocialWorkReportType)
    report_type: SocialWorkReportType;

    @ApiPropertyOptional({
        description: 'Social assessment of the patient',
        example: 'Patient shows signs of social isolation and requires community support'
    })
    @IsOptional()
    @IsString()
    social_assessment?: string;

    @ApiPropertyOptional({
        description: 'Family dynamics assessment',
        example: 'Family provides moderate support but needs education on patient care'
    })
    @IsOptional()
    @IsString()
    family_dynamics?: string;

    @ApiPropertyOptional({
        description: 'Level of family support',
        enum: SupportLevel,
        example: SupportLevel.MODERATE
    })
    @IsOptional()
    @IsEnum(SupportLevel)
    family_support_level?: SupportLevel;

    @ApiPropertyOptional({
        description: 'Current living arrangement',
        enum: LivingArrangement,
        example: LivingArrangement.NURSING_HOME
    })
    @IsOptional()
    @IsEnum(LivingArrangement)
    current_living_arrangement?: LivingArrangement;

    @ApiPropertyOptional({
        description: 'Financial situation assessment',
        example: 'Patient receives pension but has limited additional income'
    })
    @IsOptional()
    @IsString()
    financial_situation?: string;

    @ApiPropertyOptional({
        description: 'Available community resources',
        example: 'Access to local senior center and meal delivery services'
    })
    @IsOptional()
    @IsString()
    community_resources?: string;

    @ApiPropertyOptional({
        description: 'Social services needed',
        example: 'Transportation assistance and home care services'
    })
    @IsOptional()
    @IsString()
    social_services_needed?: string;

    @ApiPropertyOptional({
        description: 'Recommendations from social worker',
        example: 'Increase family involvement and connect with community resources'
    })
    @IsOptional()
    @IsString()
    recommendations?: string;

    @ApiPropertyOptional({
        description: 'Action plan for implementation',
        example: 'Schedule family meeting and contact local social services'
    })
    @IsOptional()
    @IsString()
    action_plan?: string;

    @ApiPropertyOptional({
        description: 'Follow-up notes',
        example: 'Patient responded well to initial assessment'
    })
    @IsOptional()
    @IsString()
    follow_up_notes?: string;

    @ApiPropertyOptional({
        description: 'Next follow-up date',
        example: '2025-02-15'
    })
    @IsOptional()
    @IsDateString()
    next_follow_up_date?: string;

    @ApiPropertyOptional({
        description: 'Referrals made to other services',
        example: 'Referred to nutrition program and physical therapy'
    })
    @IsOptional()
    @IsString()
    referrals_made?: string;

    @ApiPropertyOptional({
        description: 'Barriers identified during assessment',
        example: 'Transportation limitations and lack of family support'
    })
    @IsOptional()
    @IsString()
    barriers_identified?: string;

    @ApiPropertyOptional({
        description: 'Strengths identified during assessment',
        example: 'Strong family bonds and positive attitude'
    })
    @IsOptional()
    @IsString()
    strengths_identified?: string;

    @ApiPropertyOptional({
        description: 'ID of the social worker (optional, will be set from authenticated user)',
        example: 2
    })
    @IsOptional()
    @IsNumber()
    social_worker_id?: number;

    @ApiProperty({
        description: 'ID of the specialized appointment',
        example: 1
    })
    @IsNumber()
    id_appointment: number;
}

export class UpdateSocialWorkReportDto {
    @ApiPropertyOptional({
        description: 'Date and time of the social work report',
        example: '2025-02-08T10:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    report_date?: string;

    @ApiPropertyOptional({
        description: 'Type of social work report',
        enum: SocialWorkReportType,
        example: SocialWorkReportType.FOLLOW_UP
    })
    @IsOptional()
    @IsEnum(SocialWorkReportType)
    report_type?: SocialWorkReportType;

    @ApiPropertyOptional({
        description: 'Social assessment of the patient',
        example: 'Patient shows signs of social isolation and requires community support'
    })
    @IsOptional()
    @IsString()
    social_assessment?: string;

    @ApiPropertyOptional({
        description: 'Family dynamics assessment',
        example: 'Family provides moderate support but needs education on patient care'
    })
    @IsOptional()
    @IsString()
    family_dynamics?: string;

    @ApiPropertyOptional({
        description: 'Level of family support',
        enum: SupportLevel,
        example: SupportLevel.MODERATE
    })
    @IsOptional()
    @IsEnum(SupportLevel)
    family_support_level?: SupportLevel;

    @ApiPropertyOptional({
        description: 'Current living arrangement',
        enum: LivingArrangement,
        example: LivingArrangement.NURSING_HOME
    })
    @IsOptional()
    @IsEnum(LivingArrangement)
    current_living_arrangement?: LivingArrangement;

    @ApiPropertyOptional({
        description: 'Financial situation assessment',
        example: 'Patient receives pension but has limited additional income'
    })
    @IsOptional()
    @IsString()
    financial_situation?: string;

    @ApiPropertyOptional({
        description: 'Available community resources',
        example: 'Access to local senior center and meal delivery services'
    })
    @IsOptional()
    @IsString()
    community_resources?: string;

    @ApiPropertyOptional({
        description: 'Social services needed',
        example: 'Transportation assistance and home care services'
    })
    @IsOptional()
    @IsString()
    social_services_needed?: string;

    @ApiPropertyOptional({
        description: 'Recommendations from social worker',
        example: 'Increase family involvement and connect with community resources'
    })
    @IsOptional()
    @IsString()
    recommendations?: string;

    @ApiPropertyOptional({
        description: 'Action plan for implementation',
        example: 'Schedule family meeting and contact local social services'
    })
    @IsOptional()
    @IsString()
    action_plan?: string;

    @ApiPropertyOptional({
        description: 'Follow-up notes',
        example: 'Patient responded well to initial assessment'
    })
    @IsOptional()
    @IsString()
    follow_up_notes?: string;

    @ApiPropertyOptional({
        description: 'Next follow-up date',
        example: '2025-02-15'
    })
    @IsOptional()
    @IsDateString()
    next_follow_up_date?: string;

    @ApiPropertyOptional({
        description: 'Referrals made to other services',
        example: 'Referred to nutrition program and physical therapy'
    })
    @IsOptional()
    @IsString()
    referrals_made?: string;

    @ApiPropertyOptional({
        description: 'Barriers identified during assessment',
        example: 'Transportation limitations and lack of family support'
    })
    @IsOptional()
    @IsString()
    barriers_identified?: string;

    @ApiPropertyOptional({
        description: 'Strengths identified during assessment',
        example: 'Strong family bonds and positive attitude'
    })
    @IsOptional()
    @IsString()
    strengths_identified?: string;

    @ApiPropertyOptional({
        description: 'ID of the specialized appointment',
        example: 1
    })
    @IsOptional()
    @IsNumber()
    id_appointment?: number;
}