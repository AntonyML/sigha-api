import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
    @ApiPropertyOptional({
        description: 'Nombre del rol',
        example: 'coordinador general'
    })
    @IsOptional()
    @IsString({ message: 'El nombre del rol debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre del rol no puede estar vacío' })
    rName?: string;
}