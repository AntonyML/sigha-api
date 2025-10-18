import { IsEmail, IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({
        description: 'Nombre del usuario',
        example: 'Juan Carlos'
    })
    @IsOptional()
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    uName?: string;

    @ApiPropertyOptional({
        description: 'Primer apellido del usuario',
        example: 'Pérez'
    })
    @IsOptional()
    @IsString({ message: 'El primer apellido debe ser una cadena de texto' })
    uFLastName?: string;

    @ApiPropertyOptional({
        description: 'Segundo apellido del usuario',
        example: 'González'
    })
    @IsOptional()
    @IsString({ message: 'El segundo apellido debe ser una cadena de texto' })
    uSLastName?: string;

    @ApiPropertyOptional({
        description: 'Email del usuario',
        example: 'juan.carlos@hogarancianos.com'
    })
    @IsOptional()
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    uEmail?: string;

    @ApiPropertyOptional({
        description: 'ID del rol asignado al usuario',
        example: 3
    })
    @IsOptional()
    @IsInt({ message: 'El ID del rol debe ser un número entero' })
    roleId?: number;

    @ApiPropertyOptional({
        description: 'Estado activo del usuario',
        example: true
    })
    @IsOptional()
    @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
    uIsActive?: boolean;
}