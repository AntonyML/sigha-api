import { Injectable, Logger } from '@nestjs/common';
import { ResendService } from './resend.service';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';
import {
  EmailSendResult,
  PasswordResetParams,
  BackupCodesParams,
} from './email.types';
import {
  buildPasswordResetHtml,
  buildPasswordResetSubject,
  buildPasswordResetText,
} from './templates/password-reset.template';
import {
  buildBackupCodesHtml,
  buildBackupCodesSubject,
  buildBackupCodesText,
} from './templates/backup-codes-2fa.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly resend: ResendService) {}

  async sendPasswordReset(params: PasswordResetParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendPasswordReset: falta el destinatario.');
    }
    if (!params.code) {
      throw new Error('EmailService.sendPasswordReset: falta el código de verificación.');
    }

    const subject = buildPasswordResetSubject();
    const html = buildPasswordResetHtml(params);
    const text = buildPasswordResetText(params);

    try {
      const result = await this.resend.send({
        to: params.to.email,
        subject,
        html,
        text,
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
              const message = err instanceof Error ? err.message : 'Error desconocido al enviar email de recuperación';
              this.logger.error('[EmailService] sendPasswordReset falló', sanitizeForLogging({ message }));
      return { success: false, error: message };
    }
  }

  async sendBackupCodes(params: BackupCodesParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendBackupCodes: falta el destinatario.');
    }
    if (!Array.isArray(params.codes) || params.codes.length === 0) {
      throw new Error('EmailService.sendBackupCodes: se requiere al menos un código de respaldo.');
    }

    const subject = buildBackupCodesSubject();
    const html = buildBackupCodesHtml(params);
    const text = buildBackupCodesText(params);

    try {
      const result = await this.resend.send({
        to: params.to.email,
        subject,
        html,
        text,
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
              const message = err instanceof Error ? err.message : 'Error desconocido al enviar códigos de respaldo';
              this.logger.error('[EmailService] sendBackupCodes falló', sanitizeForLogging({ message }));
      return { success: false, error: message };
    }
  }
}
