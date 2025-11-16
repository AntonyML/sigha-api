import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, Min, Max, Matches, MaxLength } from 'class-validator';
import { Mobility, QualityLevel } from '../../domain/nursing';

export class CompleteAppointmentDto {
    @ApiProperty({
        description: 'Patient temperature in Celsius',
        example: 36.5,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(45)
    nrTemperature?: number;

    @ApiProperty({
        description: 'Blood pressure reading (format: XXX/XXX)',
        example: '120/80',
        required: false
    })
    @IsOptional()
    @IsString()
    @Matches(/^\d{2,3}\/\d{2,3}$/, { message: 'Blood pressure must be in format XXX/XXX (e.g., 120/80)' })
    nrBloodPressure?: string;

    @ApiProperty({
        description: 'Heart rate (beats per minute)',
        example: 72,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(250)
    nrHeartRate?: number;

    @ApiProperty({
        description: 'Pain level (scale 0-10)',
        example: 2,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    nrPainLevel?: number;

    @ApiProperty({
        description: 'Patient mobility level',
        enum: Mobility,
        example: Mobility.INDEPENDENT,
        required: false
    })
    @IsOptional()
    @IsEnum(Mobility)
    nrMobility?: Mobility;

    @ApiProperty({
        description: 'Patient appetite quality',
        enum: QualityLevel,
        example: QualityLevel.GOOD,
        required: false
    })
    @IsOptional()
    @IsEnum(QualityLevel)
    nrAppetite?: QualityLevel;

    @ApiProperty({
        description: 'Patient sleep quality',
        enum: QualityLevel,
        example: QualityLevel.REGULAR,
        required: false
    })
    @IsOptional()
    @IsEnum(QualityLevel)
    nrSleepQuality?: QualityLevel;

    @ApiProperty({
        description: 'Additional notes about the appointment and patient condition',
        example: 'Patient in good general condition. Blood pressure stable.',
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(5000)
    nrNotes?: string;
}
