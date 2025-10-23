import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateSubProgramDto {
    @ApiProperty({
        description: 'Name of the sub-program',
        example: 'Cuidado General',
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    spName: string;

    @ApiProperty({
        description: 'ID of the program this sub-program belongs to',
        example: 1
    })
    @IsInt()
    @IsPositive()
    idProgram: number;
}