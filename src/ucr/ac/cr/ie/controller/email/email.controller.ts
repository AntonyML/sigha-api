import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { EmailService } from '../../services/email';
import { SendBackupCodesEmailDto, SendPasswordResetEmailDto } from '../../dto/email';

@ApiTags('Email')
@ApiBearerAuth('jwt')
@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de recuperación de contraseña',
    description: 'Envía un email con un código de 8 dígitos para que el usuario pueda restablecer su contraseña.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendPasswordReset(@Body() dto: SendPasswordResetEmailDto) {
    return this.emailService.sendPasswordReset({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      code: dto.code,
      expirationLabel: dto.expirationLabel,
    });
  }

  @Post('backup-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email con códigos de respaldo 2FA',
    description: 'Envía un email con los 8 códigos de respaldo que el usuario puede usar si pierde acceso a su app TOTP.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendBackupCodes(@Body() dto: SendBackupCodesEmailDto) {
    return this.emailService.sendBackupCodes({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      codes: dto.codes,
    });
  }
}
