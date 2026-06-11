import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';
import { AppointmentType, AppointmentPriority, AppointmentStatus } from '../../domain/nursing';

export class CreateSpecializedAppointmentDto {
    @ApiProperty({ description: 'Appointment date and time', example: '2026-03-15T10:00:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    saAppointmentDate: string;

    @ApiPropertyOptional({ description: 'Type of appointment', enum: AppointmentType, example: AppointmentType.CHECKUP })
    @IsOptional()
    @IsEnum(AppointmentType)
    saAppointmentType?: AppointmentType;

    @ApiPropertyOptional({ description: 'Priority level', enum: AppointmentPriority, example: AppointmentPriority.MEDIUM })
    @IsOptional()
    @IsEnum(AppointmentPriority)
    saPriority?: AppointmentPriority;

    @ApiPropertyOptional({ description: 'Appointment status', enum: AppointmentStatus, example: AppointmentStatus.SCHEDULED })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    saStatus?: AppointmentStatus;

    @ApiPropertyOptional({ description: 'Notes for the appointment', example: 'Patient requires wheelchair assistance' })
    @IsOptional()
    @IsString()
    saNotes?: string;

    @ApiPropertyOptional({ description: 'Clinical observations', example: 'Monitor blood pressure during visit' })
    @IsOptional()
    @IsString()
    saObservations?: string;

    @ApiPropertyOptional({ description: 'Duration in minutes', example: 30 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(480)
    saDurationMinutes?: number;

    @ApiPropertyOptional({ description: 'Next appointment date', example: '2026-04-15T10:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    saNextAppointment?: string;

    @ApiProperty({ description: 'Specialized area ID', example: 1 })
    @IsNumber()
    idArea: number;

    @ApiProperty({ description: 'Patient (older adult) ID', example: 1 })
    @IsNumber()
    idPatient: number;

    @ApiProperty({ description: 'Staff (user) ID', example: 1 })
    @IsNumber()
    idStaff: number;
}
