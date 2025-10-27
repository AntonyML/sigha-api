import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotifuseService } from '../../services/notifuse/notifuse.service';
import { Send8Codes2FADto } from '../../dto/notifuse/send-8-codes-2fa-notifuse.dto';
import { SendCodeVerifyEmailDto } from '../../dto/notifuse/send-code-verify-notifuse.dto';

@ApiTags('Notifuse')
@Controller('notifuse')
export class NotifuseController {
  constructor(private readonly notifuseService: NotifuseService) {}

  @Post('send-8-codes')
  @ApiOperation({ summary: 'Enviar plantilla 8_codes_2fa_email' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async send8Codes(@Request() req, @Body() body: Send8Codes2FADto) {
    const userId = req?.user?.userId || null;
    return await this.notifuseService.send8Codes2FA(userId, body);
  }

  @Post('send-code-verify')
  @ApiOperation({ summary: 'Enviar plantilla code_verify_email' })
  @ApiResponse({ status: 200, description: 'Notificación enviada' })
  async sendCodeVerify(@Request() req, @Body() body: SendCodeVerifyEmailDto) {
    const userId = req?.user?.userId || null;
    return await this.notifuseService.sendCodeVerifyEmail(userId, body);
  }
}
