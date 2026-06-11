import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateEmergencyContactDto {
    @ApiProperty({
        description: 'Emergency contact phone number',
        example: '+506 8888-0000',
        maxLength: 20
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    enPhoneNumber: string;

    @ApiPropertyOptional({
        description: 'ID of the associated older adult',
        example: 1
    })
    @IsOptional()
    @IsNumber()
    idOlderAdult?: number;
}
