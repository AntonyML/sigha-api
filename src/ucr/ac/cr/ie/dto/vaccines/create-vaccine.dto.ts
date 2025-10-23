import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateVaccineDto {
    @ApiProperty({
        description: 'Name of the vaccine',
        example: 'Difteria y Tétanos (dT)',
        maxLength: 80
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    vName: string;
}