import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotifuseService } from '../../services/notifuse/notifuse.service';
import { Send6Codes2FADto } from '../../dto/notifuse/send-6-codes-2fa-notifuse.dto';
import { SendCodeVerifyEmailDto } from '../../dto/notifuse/send-code-verify-notifuse.dto';

@ApiTags('Notifuse')
@Controller('notifuse')
export class NotifuseController {
  constructor(private readonly notifuseService: NotifuseService) {}

  @Post('send-6-codes')
  @ApiOperation({ summary: 'Enviar plantilla 6_codes_2fa_email' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async send6Codes(@Request() req, @Body() body: Send6Codes2FADto) {
    const userId = req?.user?.userId || null;
    return await this.notifuseService.send6Codes2FA(userId, body);
  }

  @Post('send-code-verify')
  @ApiOperation({ summary: 'Enviar plantilla code_verify_email' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async sendCodeVerify(@Request() req, @Body() body: SendCodeVerifyEmailDto) {
    const userId = req?.user?.userId || null;
    return await this.notifuseService.sendCodeVerifyEmail(userId, body);
  }
}
