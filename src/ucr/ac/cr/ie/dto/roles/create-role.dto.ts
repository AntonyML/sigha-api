import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nombre del rol',
        example: 'coordinador'
    })
    @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del rol no puede estar vacío' })
    rName: string;
}