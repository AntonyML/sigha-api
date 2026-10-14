import { Injectable, Logger, Optional } from '@nestjs/common';
import { MailerService } from './mailer.service';

export interface ResendSendParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface ResendSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * @deprecated Use MailerService or EmailService directly.
 * Kept for backward compatibility with existing tests and modules.
 */
@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);

  constructor(@Optional() private readonly mailerService?: MailerService) {}

  isEnabled(): boolean {
    return this.mailerService?.isEnabled() ?? false;
  }

  getFromAddress(): string {
    return 'SIGHA <hello@tonyml.com>';
  }

  async send(params: ResendSendParams): Promise<ResendSendResult> {
    if (!this.mailerService || !this.mailerService.isEnabled()) {
      return { success: false, error: 'MailerService no configurado' };
    }
    const result = await this.mailerService.sendMail({
      to: params.to,
      variables: {
        html: params.html,
        subject: params.subject,
      },
    });
    return { success: result.success, messageId: result.messageId, error: result.error };
  }
}
