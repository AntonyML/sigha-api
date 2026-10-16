import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

export interface MailerSendParams {
  to: string;
  template?: string;
  variables?: Record<string, unknown>;
  replyTo?: string;
}

export interface MailerSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly baseUrl: string;
  private readonly appKey: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>('MAILER_BASE_URL') || 'https://mailer.tonyml.com/api/send'
    ).trim();
    this.appKey = (this.configService.get<string>('MAILER_APP_KEY') || '').trim();
    this.enabled = Boolean(this.appKey) && Boolean(this.baseUrl);

    if (!this.enabled) {
      this.logger.warn(
        '[MailerService] MAILER_APP_KEY o MAILER_BASE_URL no configurados. Los envíos de email estarán deshabilitados hasta que se configuren.',
      );
    } else {
      this.logger.log(
        '[MailerService] Inicializado correctamente con Mailbridge',
        sanitizeForLogging({
          baseUrl: this.baseUrl,
          appKeyPrefix: this.appKey.slice(0, 10) + '••••••••',
        }),
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendMail(params: MailerSendParams): Promise<MailerSendResult> {
    if (!this.enabled) {
      const reason = 'MailerService no está configurado (falta MAILER_APP_KEY).';
      this.logger.error('[MailerService] No está configurado', sanitizeForLogging({ reason }));
      throw new InternalServerErrorException(reason);
    }

    try {
      const payload: Record<string, unknown> = {
        to_override: params.to,
        variables: params.variables || {},
      };

      if (params.template) {
        payload.template = params.template;
      }
      if (params.replyTo) {
        payload.reply_to = params.replyTo;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-key': this.appKey,
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        success?: boolean;
        id?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.success) {
        const errorMsg =
          data?.error || `Error en Mailbridge HTTP ${response.status}: ${response.statusText}`;
        this.logger.error(
          '[MailerService] Error al enviar email',
          sanitizeForLogging({ to: params.to, template: params.template, error: errorMsg }),
        );
        throw new InternalServerErrorException(errorMsg);
      }

      const messageId = data.id;
      this.logger.log(
        '[MailerService] Email enviado exitosamente',
        sanitizeForLogging({ to: params.to, template: params.template, messageId }),
      );
      return { success: true, messageId };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error desconocido al enviar email vía Mailbridge';
      this.logger.error(
        '[MailerService] Excepción al enviar email',
        sanitizeForLogging({ to: params.to, template: params.template, message }),
      );
      throw new InternalServerErrorException(message);
    }
  }
}
