import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Código temporal de 8 dígitos recibido por email',
        example: '48213976'
    })
    @IsString({ message: 'El token debe ser una cadena de texto' })
    @MinLength(8, { message: 'El token debe tener exactamente 8 caracteres' })
    @MaxLength(8, { message: 'El token debe tener exactamente 8 caracteres' })
    @Matches(/^\d{8}$/, { message: 'El token debe contener solo dígitos' })
    token: string;

    @ApiProperty({
        description: 'Nueva contraseña (mínimo 8 caracteres)',
        example: 'NuevaPassword123!'
    })
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    newPassword: string;
}