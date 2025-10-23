import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateClinicalConditionDto {
    @ApiProperty({
        description: 'Name of the clinical condition',
        example: 'Hipertensión arterial (HTA)',
        maxLength: 55
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(55)
    ccName: string;
}