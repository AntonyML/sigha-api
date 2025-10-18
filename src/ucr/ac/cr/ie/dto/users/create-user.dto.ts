import { IsEmail, IsString, IsOptional, IsInt, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'Número de identificación del usuario',
        example: '123456789'
    })
    @IsString({ message: 'La identificación debe ser una cadena de texto' })
    @Matches(/^[0-9]+$/, { message: 'La identificación debe contener solo números' })
    uIdentification: string;

    @ApiProperty({
        description: 'Nombre del usuario',
        example: 'Juan'
    })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    uName: string;

    @ApiProperty({
        description: 'Primer apellido del usuario',
        example: 'Pérez'
    })
    @IsString({ message: 'El primer apellido debe ser una cadena de texto' })
    uFLastName: string;

    @ApiPropertyOptional({
        description: 'Segundo apellido del usuario',
        example: 'González'
    })
    @IsOptional()
    @IsString({ message: 'El segundo apellido debe ser una cadena de texto' })
    uSLastName?: string;

    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan.perez@hogarancianos.com'
    })
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    uEmail: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'SecurePassword123!',
        minLength: 8
    })
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    uPassword: string;

    @ApiProperty({
        description: 'ID del rol asignado al usuario',
        example: 2
    })
    @IsInt({ message: 'El ID del rol debe ser un número entero' })
    roleId: number;
}