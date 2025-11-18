import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AppointmentStatus, AppointmentPriority, SpecializedAreaName } from '../../domain/nursing';

export class GetNursingAppointmentsDto {
    @ApiProperty({
        description: 'Filter by appointment status',
        enum: AppointmentStatus,
        required: false,
        example: AppointmentStatus.SCHEDULED
    })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @ApiProperty({
        description: 'Filter by priority level',
        enum: AppointmentPriority,
        required: false,
        example: AppointmentPriority.MEDIUM
    })
    @IsOptional()
    @IsEnum(AppointmentPriority)
    priority?: AppointmentPriority;

    @ApiProperty({
        description: 'Filter by specialized area',
        enum: SpecializedAreaName,
        required: false,
        example: SpecializedAreaName.NURSING
    })
    @IsOptional()
    @IsEnum(SpecializedAreaName)
    area?: SpecializedAreaName;

    @ApiProperty({
        description: 'Filter by date from (ISO format)',
        required: false,
        example: '2025-11-01T00:00:00Z'
    })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiProperty({
        description: 'Filter by date to (ISO format)',
        required: false,
        example: '2025-11-30T23:59:59Z'
    })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @ApiProperty({
        description: 'Filter by patient ID',
        required: false,
        example: 1
    })
    @IsOptional()
    patientId?: number;
}
