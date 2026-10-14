import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';
import {
  EmailSendResult,
  PasswordResetParams,
  BackupCodesParams,
  UserRequestParams,
  UserRequestConfirmationParams,
  WelcomeUserParams,
  EmailVerificationParams,
} from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendPasswordReset(params: PasswordResetParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendPasswordReset: falta el destinatario.');
    }
    if (!params.code) {
      throw new Error('EmailService.sendPasswordReset: falta el código de verificación.');
    }

    const formattedCode =
      params.code.length === 8
        ? `${params.code.slice(0, 4)} ${params.code.slice(4)}`
        : params.code;

    try {
      const result = await this.mailer.sendMail({
        template: 'password-reset',
        to: params.to.email,
        variables: {
          firstName: params.to.firstName,
          code: formattedCode,
          expirationLabel: params.expirationLabel || '15 minutos',
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al enviar email de recuperación';
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

    const codesList = params.codes.map((c, idx) => `  ${idx + 1}. ${c}`).join('\n');

    try {
      const result = await this.mailer.sendMail({
        template: 'backup-codes',
        to: params.to.email,
        variables: {
          firstName: params.to.firstName,
          codesList,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al enviar códigos de respaldo';
      this.logger.error('[EmailService] sendBackupCodes falló', sanitizeForLogging({ message }));
      return { success: false, error: message };
    }
  }

  async sendUserRequest(params: UserRequestParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendUserRequest: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'user-request',
        to: params.to.email,
        variables: {
          requesterName: params.requesterName,
          requesterEmail: params.requesterEmail,
          requesterPhone: params.requesterPhone,
          reason: params.reason,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar notificación de solicitud de cuenta';
      this.logger.error('[EmailService] sendUserRequest falló', sanitizeForLogging({ message }));
      return { success: false, error: message };
    }
  }

  async sendUserRequestConfirmation(
    params: UserRequestConfirmationParams,
  ): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendUserRequestConfirmation: falta el destinatario.');
    }

    const fullName = `${params.to.firstName} ${params.to.lastName || ''}`.trim();

    try {
      const result = await this.mailer.sendMail({
        template: 'user-request-confirmation',
        to: params.to.email,
        variables: {
          fullName,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar confirmación de solicitud de cuenta';
      this.logger.error(
        '[EmailService] sendUserRequestConfirmation falló',
        sanitizeForLogging({ message }),
      );
      return { success: false, error: message };
    }
  }

  async sendWelcomeUser(params: WelcomeUserParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendWelcomeUser: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'welcome-user',
        to: params.to.email,
        variables: {
          firstName: params.to.firstName,
          roleName: params.roleName,
          email: params.to.email,
          activationUrl: params.activationUrl,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar email de bienvenida al usuario';
      this.logger.error('[EmailService] sendWelcomeUser falló', sanitizeForLogging({ message }));
      return { success: false, error: message };
    }
  }

  async sendEmailVerification(params: EmailVerificationParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendEmailVerification: falta el destinatario.');
    }
    if (!params.code) {
      throw new Error('EmailService.sendEmailVerification: falta el código de verificación.');
    }

    const formattedCode =
      params.code.length === 8
        ? `${params.code.slice(0, 4)} ${params.code.slice(4)}`
        : params.code;

    try {
      const result = await this.mailer.sendMail({
        template: 'email-verification',
        to: params.to.email,
        variables: {
          firstName: params.to.firstName,
          code: formattedCode,
          expirationLabel: params.expirationLabel || '15 minutos',
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar código de verificación de email';
      this.logger.error(
        '[EmailService] sendEmailVerification falló',
        sanitizeForLogging({ message }),
      );
      return { success: false, error: message };
    }
  }
}
