import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsPositive, MaxLength, Min } from 'class-validator';
import { AppointmentType, AppointmentPriority } from '../../domain/nursing';

export class CreateAppointmentDto {
    @ApiProperty({
        description: 'Appointment date and time',
        example: '2025-11-20T10:00:00Z'
    })
    @IsNotEmpty()
    @IsDateString()
    saAppointmentDate: string;

    @ApiProperty({
        description: 'Type of appointment',
        enum: AppointmentType,
        example: AppointmentType.CHECKUP
    })
    @IsNotEmpty()
    @IsEnum(AppointmentType)
    saAppointmentType: AppointmentType;

    @ApiProperty({
        description: 'Priority level of the appointment',
        enum: AppointmentPriority,
        example: AppointmentPriority.MEDIUM
    })
    @IsNotEmpty()
    @IsEnum(AppointmentPriority)
    saPriority: AppointmentPriority;

    @ApiProperty({
        description: 'Notes about the appointment',
        required: false,
        example: 'Regular checkup for monitoring blood pressure'
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    saNotes?: string;

    @ApiProperty({
        description: 'Estimated duration in minutes',
        required: false,
        example: 30
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    saDurationMinutes?: number;

    @ApiProperty({
        description: 'ID of the specialized area (nursing)',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    idArea: number;

    @ApiProperty({
        description: 'ID of the patient (older adult)',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    idPatient: number;

    @ApiProperty({
        description: 'ID of the staff member assigned',
        example: 1
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    idStaff: number;
}
