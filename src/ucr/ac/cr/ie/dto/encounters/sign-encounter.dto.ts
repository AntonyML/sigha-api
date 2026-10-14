import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class SignEncounterDto {
    @ApiProperty({ example: 22, description: 'ID del profesional que firma y cierra la nota clínica' })
    @IsNotEmpty()
    @IsInt()
    signedBy!: number;
}
