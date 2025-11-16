import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';

export class CancelAppointmentDto {
    @ApiProperty({
        description: 'Reason for cancellation',
        example: 'Patient requested cancellation due to personal reasons',
        required: false
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    cancellationReason?: string;
}
