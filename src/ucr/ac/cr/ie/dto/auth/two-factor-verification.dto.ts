import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorVerificationDto {
    @ApiProperty({
        description: 'Token temporal recibido durante el login inicial',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    @IsString({ message: 'El token temporal debe ser una cadena de texto' })
    tempToken: string;

    @ApiProperty({
        description: 'Código de verificación de 6 dígitos',
        example: '123456',
        minLength: 6,
        maxLength: 6
    })
    @IsString({ message: 'El código de verificación debe ser una cadena de texto' })
    @Length(6, 6, { message: 'El código de verificación debe tener exactamente 6 dígitos' })
    twoFactorCode: string;
}