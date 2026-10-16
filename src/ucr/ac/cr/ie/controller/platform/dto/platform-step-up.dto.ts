import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/**
 * Payload for the platform step-up flow: a fresh TOTP code that re-authenticates
 * the platform operator and yields a short-lived, purpose-bound token.
 */
export class PlatformStepUpDto {
  @ApiProperty({
    description: 'Código TOTP de 6 dígitos del autenticador',
    example: '123456',
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @Matches(/^\d{6}$/, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;
}
