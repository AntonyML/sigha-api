import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'admin@hogarancianos.com'
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

    @ApiPropertyOptional({
        description: 'Código de autenticación de dos factores (requerido si está habilitado)',
        example: '123456'
    })
    @IsOptional()
    @IsString({ message: 'El código 2FA debe ser una cadena de texto' })
    twoFactorCode?: string;
}