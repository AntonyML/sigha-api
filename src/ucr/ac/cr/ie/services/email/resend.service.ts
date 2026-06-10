import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

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

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly client: Resend | null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = (this.configService.get<string>('RESEND_API_KEY') || '').trim();
    this.fromEmail = (this.configService.get<string>('RESEND_FROM_EMAIL') || '').trim();
    this.fromName = (this.configService.get<string>('RESEND_FROM_NAME') || 'Sistema Hogar de Ancianos').trim();
    this.enabled = Boolean(apiKey) && Boolean(this.fromEmail);

    if (!this.enabled) {
      this.logger.warn(
        '[ResendService] RESEND_API_KEY o RESEND_FROM_EMAIL no configurados. Los envíos de email estarán deshabilitados hasta que se configuren.',
      );
      this.client = null;
      return;
    }

    this.client = new Resend(apiKey);
    this.logger.log(`[ResendService] Inicializado con remitente "${this.fromName} <${this.fromEmail}>".`);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getFromAddress(): string {
    return `${this.fromName} <${this.fromEmail}>`;
  }

  async send(params: ResendSendParams): Promise<ResendSendResult> {
    if (!this.enabled || !this.client) {
      const reason = 'Resend no está configurado (faltan RESEND_API_KEY o RESEND_FROM_EMAIL).';
      this.logger.error(`[ResendService] ${reason}`);
      throw new InternalServerErrorException(reason);
    }

    try {
      const response = await this.client.emails.send({
        from: this.getFromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      if (response.error) {
        const message = response.error.message || 'Error desconocido al enviar email';
        this.logger.error(`[ResendService] Error al enviar a ${params.to}: ${message}`);
        throw new InternalServerErrorException(message);
      }

      const messageId = response.data?.id;
      this.logger.log(`[ResendService] Email enviado a ${params.to} (id: ${messageId ?? 'n/a'}).`);
      return { success: true, messageId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al enviar email';
      this.logger.error(`[ResendService] Excepción al enviar a ${params.to}: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }
}
