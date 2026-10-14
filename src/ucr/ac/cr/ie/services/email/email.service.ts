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
  ContactInquiryParams,
  ContactInquiryAutoresponderParams,
  AppointmentReminderParams,
  ResidentMedicalAlertParams,
  ResidentLeaveEntryParams,
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

  async sendContactInquiry(params: ContactInquiryParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendContactInquiry: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'contact-inquiry',
        to: params.to.email,
        variables: {
          name: params.name,
          organization: params.organization,
          email: params.email,
          message: params.message,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al enviar consulta de contacto web';
      this.logger.error('[EmailService] sendContactInquiry falló', sanitizeForLogging({ message }));
      return { success: false, error: message };
    }
  }

  async sendContactInquiryAutoresponder(
    params: ContactInquiryAutoresponderParams,
  ): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendContactInquiryAutoresponder: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'contact-inquiry-autoresponder',
        to: params.to.email,
        variables: {
          name: params.name,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar confirmación de consulta web';
      this.logger.error(
        '[EmailService] sendContactInquiryAutoresponder falló',
        sanitizeForLogging({ message }),
      );
      return { success: false, error: message };
    }
  }

  async sendAppointmentReminder(params: AppointmentReminderParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendAppointmentReminder: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'appointment-reminder',
        to: params.to.email,
        variables: {
          areaName: params.areaName,
          patientName: params.patientName,
          recipientName: params.recipientName,
          appointmentDate: params.appointmentDate,
          appointmentTime: params.appointmentTime,
          staffName: params.staffName,
          notes: params.notes || 'Ninguna observación adicional',
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar recordatorio de cita médica';
      this.logger.error(
        '[EmailService] sendAppointmentReminder falló',
        sanitizeForLogging({ message }),
      );
      return { success: false, error: message };
    }
  }

  async sendResidentMedicalAlert(params: ResidentMedicalAlertParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendResidentMedicalAlert: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'resident-medical-alert',
        to: params.to.email,
        variables: {
          patientName: params.patientName,
          contactName: params.contactName,
          incidentType: params.incidentType,
          incidentDate: params.incidentDate,
          description: params.description,
          actionTaken: params.actionTaken,
          contactPhone: params.contactPhone,
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar alerta médica de residente';
      this.logger.error(
        '[EmailService] sendResidentMedicalAlert falló',
        sanitizeForLogging({ message }),
      );
      return { success: false, error: message };
    }
  }

  async sendResidentLeaveEntry(params: ResidentLeaveEntryParams): Promise<EmailSendResult> {
    if (!params?.to?.email) {
      throw new Error('EmailService.sendResidentLeaveEntry: falta el destinatario.');
    }

    try {
      const result = await this.mailer.sendMail({
        template: 'resident-leave-entry',
        to: params.to.email,
        variables: {
          movementType: params.movementType,
          patientName: params.patientName,
          familiarName: params.familiarName,
          movementDateTime: params.movementDateTime,
          authorizedBy: params.authorizedBy,
          destinationOrReason: params.destinationOrReason,
          expectedReturn: params.expectedReturn || 'No especificado',
        },
      });
      return { success: result.success, messageId: result.messageId };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al enviar constancia de entrada/salida de residente';
      this.logger.error(
        '[EmailService] sendResidentLeaveEntry falló',
        sanitizeForLogging({ message }),
      );
      return { success: false, error: message };
    }
  }
}
