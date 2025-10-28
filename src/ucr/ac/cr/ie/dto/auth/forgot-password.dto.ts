import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Email del usuario para enviar el código de recuperación',
        example: 'usuario@example.com'
    })
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    email: string;
}