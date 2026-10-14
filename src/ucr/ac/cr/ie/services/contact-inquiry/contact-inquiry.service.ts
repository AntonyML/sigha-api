import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { CreateContactInquiryDto } from '../../dto/contact-inquiry';
import { sanitizeForLogging } from '@common/utils/logger-sanitizer';

@Injectable()
export class ContactInquiryService {
  private readonly logger = new Logger(ContactInquiryService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async processInquiry(dto: CreateContactInquiryDto): Promise<{ success: boolean; message: string }> {
    const adminInbox =
      this.configService.get<string>('CONTACT_INQUIRY_EMAIL') ||
      this.configService.get<string>('ADMIN_NOTIFICATION_EMAIL') ||
      'contacto@sigha.cr';

    this.logger.log(
      '[ContactInquiryService] Procesando consulta web',
      sanitizeForLogging({ from: dto.email, organization: dto.organization }),
    );

    // 1. Notificación a administración
    const adminNotificationResult = await this.emailService.sendContactInquiry({
      to: { email: adminInbox, firstName: 'Equipo SIGHA' },
      name: dto.name,
      organization: dto.organization || 'Particular',
      email: dto.email,
      message: dto.message,
    });

    if (!adminNotificationResult.success) {
      this.logger.warn(
        '[ContactInquiryService] No se pudo enviar notificación a la administración',
        sanitizeForLogging({ error: adminNotificationResult.error }),
      );
    }

    // 2. Acuse de recibo automático al interesado
    const autoresponderResult = await this.emailService.sendContactInquiryAutoresponder({
      to: { email: dto.email, firstName: dto.name.split(' ')[0] },
      name: dto.name,
    });

    if (!autoresponderResult.success) {
      this.logger.warn(
        '[ContactInquiryService] No se pudo enviar acuse de recibo al interesado',
        sanitizeForLogging({ error: autoresponderResult.error }),
      );
    }

    return {
      success: true,
      message: 'Tu consulta ha sido enviada satisfactoriamente. Nos comunicaremos pronto.',
    };
  }
}
