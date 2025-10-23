import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateProgramDto {
    @ApiProperty({
        description: 'Name of the program',
        example: 'Hogar de Larga Instancia',
        maxLength: 300
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(300)
    pName: string;
}