import { describe, it, expect, mock } from 'bun:test';
import { ContactInquiryService } from './contact-inquiry.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

describe('ContactInquiryService', () => {
  function createService() {
    const mockEmailService = {
      sendContactInquiry: mock(async () => ({ success: true, messageId: 'inquiry-123' })),
      sendContactInquiryAutoresponder: mock(async () => ({ success: true, messageId: 'auto-123' })),
    } as unknown as EmailService;

    const mockConfigService = {
      get: mock((key: string) => {
        if (key === 'CONTACT_INQUIRY_EMAIL') return 'contacto-admin@sigha.cr';
        return undefined;
      }),
    } as unknown as ConfigService;

    const service = new ContactInquiryService(mockEmailService, mockConfigService);
    return { service, mockEmailService, mockConfigService };
  }

  it('debe enviar la consulta web al admin y el acuse de recibo al usuario', async () => {
    const { service, mockEmailService } = createService();

    const result = await service.processInquiry({
      name: 'Valeria Solís',
      organization: 'Asociación Renacer',
      email: 'valeria@renacer.cr',
      message: 'Consulta de coordinación interinstitucional',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('enviada');

    const adminCall = (mockEmailService.sendContactInquiry as any).mock.calls[0][0];
    expect(adminCall.to.email).toBe('contacto-admin@sigha.cr');
    expect(adminCall.name).toBe('Valeria Solís');
    expect(adminCall.organization).toBe('Asociación Renacer');
    expect(adminCall.email).toBe('valeria@renacer.cr');

    const autoresponderCall = (mockEmailService.sendContactInquiryAutoresponder as any).mock.calls[0][0];
    expect(autoresponderCall.to.email).toBe('valeria@renacer.cr');
    expect(autoresponderCall.name).toBe('Valeria Solís');
  });

  it('debe tolerar fallos en el autoresponder sin romper la respuesta al usuario', async () => {
    const { service, mockEmailService } = createService();
    (mockEmailService.sendContactInquiryAutoresponder as any).mockImplementation(async () => ({
      success: false,
      error: 'Fallo de transporte',
    }));

    const result = await service.processInquiry({
      name: 'Carlos Solano',
      organization: '',
      email: 'carlos@sigha.cr',
      message: 'Pregunta general',
    });

    expect(result.success).toBe(true);
  });
});
