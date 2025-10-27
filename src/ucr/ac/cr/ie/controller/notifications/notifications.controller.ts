import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { Send6Codes2FADto } from '../../dto/notifications/send-6-codes-2fa.dto';
import { SendCodeVerifyEmailDto } from '../../dto/notifications/send-code-verify.dto';

@ApiTags('Notificaciones')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send-6-codes')
  @ApiOperation({ summary: 'Enviar plantilla 6_codes_2fa_email' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async send6Codes(@Request() req, @Body() body: Send6Codes2FADto) {
    const userId = req?.user?.userId || null;
    return await this.notificationsService.send6Codes2FA(userId, body);
  }

  @Post('send-code-verify')
  @ApiOperation({ summary: 'Enviar plantilla code_verify_email' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async sendCodeVerify(@Request() req, @Body() body: SendCodeVerifyEmailDto) {
    const userId = req?.user?.userId || null;
    return await this.notificationsService.sendCodeVerifyEmail(userId, body);
  }
}
