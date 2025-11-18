import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber, IsDateString, IsPositive, MaxLength, Min } from 'class-validator';
import { AppointmentType, AppointmentPriority } from '../../domain/nursing';

export class UpdateAppointmentDto {
    @ApiProperty({
        description: 'Appointment date and time',
        example: '2025-11-25T14:00:00Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    saAppointmentDate?: string;

    @ApiProperty({
        description: 'Type of appointment',
        enum: AppointmentType,
        example: AppointmentType.CHECKUP,
        required: false
    })
    @IsOptional()
    @IsEnum(AppointmentType)
    saAppointmentType?: AppointmentType;

    @ApiProperty({
        description: 'Priority level of the appointment',
        enum: AppointmentPriority,
        example: AppointmentPriority.HIGH,
        required: false
    })
    @IsOptional()
    @IsEnum(AppointmentPriority)
    saPriority?: AppointmentPriority;

    @ApiProperty({
        description: 'Notes about the appointment',
        required: false,
        example: 'Updated: Patient requested earlier appointment'
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    saNotes?: string;

    @ApiProperty({
        description: 'Observations after appointment',
        required: false,
        example: 'Patient showed improvement'
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    saObservations?: string;

    @ApiProperty({
        description: 'Duration in minutes',
        required: false,
        example: 45
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Min(1)
    saDurationMinutes?: number;

    @ApiProperty({
        description: 'ID of the staff member assigned',
        example: 2,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    idStaff?: number;
}
