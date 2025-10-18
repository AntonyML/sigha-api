import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Enable2FADto {
    @ApiProperty({
        description: 'Código de verificación de 6 dígitos para habilitar 2FA',
        example: '123456',
        minLength: 6,
        maxLength: 6
    })
    @IsString({ message: 'El código de verificación debe ser una cadena de texto' })
    @Length(6, 6, { message: 'El código de verificación debe tener exactamente 6 dígitos' })
    verificationCode: string;
}