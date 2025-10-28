import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Código temporal de 18 caracteres recibido por email',
        example: 'A1b2C3d4E5f6G7h8I9!'
    })
    @IsString({ message: 'El token debe ser una cadena de texto' })
    @MinLength(18, { message: 'El token debe tener exactamente 18 caracteres' })
    @MaxLength(18, { message: 'El token debe tener exactamente 18 caracteres' })
    token: string;

    @ApiProperty({
        description: 'Nueva contraseña (mínimo 8 caracteres)',
        example: 'NuevaPassword123!'
    })
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    newPassword: string;
}