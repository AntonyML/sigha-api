import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Contraseña actual del usuario',
        example: 'CurrentPassword123!'
    })
    @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
    currentPassword: string;

    @ApiProperty({
        description: 'Nueva contraseña del usuario',
        example: 'NewSecurePassword123!',
        minLength: 8
    })
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    newPassword: string;
}