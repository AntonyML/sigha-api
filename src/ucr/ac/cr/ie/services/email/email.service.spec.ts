import { describe, it, expect, mock } from 'bun:test';
import { EmailService } from './email.service';
import { MailerService } from './mailer.service';

describe('EmailService', () => {
  function createService() {
    const mockMailer = {
      sendMail: mock(async (params: any) => ({
        success: true,
        messageId: 'msg-mock-id-123',
      })),
    } as unknown as MailerService;

    const emailService = new EmailService(mockMailer);
    return { emailService, mockMailer };
  }

  it('sendPasswordReset debe formatear el código y enviar la plantilla password-reset', async () => {
    const { emailService, mockMailer } = createService();

    const result = await emailService.sendPasswordReset({
      to: { email: 'usuario@sigha.cr', firstName: 'Elena' },
      code: '12345678',
      expirationLabel: '10 minutos',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-mock-id-123');
    expect((mockMailer.sendMail as any).mock.calls.length).toBe(1);

    const callArgs = (mockMailer.sendMail as any).mock.calls[0][0];
    expect(callArgs.template).toBe('password-reset');
    expect(callArgs.to).toBe('usuario@sigha.cr');
    expect(callArgs.variables.firstName).toBe('Elena');
    expect(callArgs.variables.code).toBe('1234 5678');
    expect(callArgs.variables.expirationLabel).toBe('10 minutos');
  });

  it('sendPasswordReset debe fallar si falta el destinatario o código', async () => {
    const { emailService } = createService();

    await expect(
      emailService.sendPasswordReset({ to: { email: '', firstName: '' }, code: '1234' }),
    ).rejects.toThrow();

    await expect(
      emailService.sendPasswordReset({ to: { email: 'test@sigha.cr', firstName: 'A' }, code: '' }),
    ).rejects.toThrow();
  });

  it('sendBackupCodes debe formatear la lista de códigos y llamar a la plantilla backup-codes', async () => {
    const { emailService, mockMailer } = createService();

    const result = await emailService.sendBackupCodes({
      to: { email: 'admin@sigha.cr', firstName: 'Roberto' },
      codes: ['code1', 'code2', 'code3'],
    });

    expect(result.success).toBe(true);
    const callArgs = (mockMailer.sendMail as any).mock.calls[0][0];
    expect(callArgs.template).toBe('backup-codes');
    expect(callArgs.to).toBe('admin@sigha.cr');
    expect(callArgs.variables.codesList).toContain('code1');
    expect(callArgs.variables.codesList).toContain('code2');
  });

  it('sendUserRequest debe enviar plantilla user-request con los datos del solicitante', async () => {
    const { emailService, mockMailer } = createService();

    const result = await emailService.sendUserRequest({
      to: { email: 'director@sigha.cr', firstName: 'Dirección' },
      requesterName: 'Laura Méndez',
      requesterEmail: 'laura@external.org',
      requesterPhone: '8888-9999',
      reason: 'Solicito acceso para módulo de enfermería',
    });

    expect(result.success).toBe(true);
    const callArgs = (mockMailer.sendMail as any).mock.calls[0][0];
    expect(callArgs.template).toBe('user-request');
    expect(callArgs.variables.requesterName).toBe('Laura Méndez');
    expect(callArgs.variables.requesterEmail).toBe('laura@external.org');
  });

  it('sendUserRequestConfirmation debe enviar plantilla user-request-confirmation al solicitante', async () => {
    const { emailService, mockMailer } = createService();

    const result = await emailService.sendUserRequestConfirmation({
      to: { email: 'laura@external.org', firstName: 'Laura', lastName: 'Méndez' },
    });

    expect(result.success).toBe(true);
    const callArgs = (mockMailer.sendMail as any).mock.calls[0][0];
    expect(callArgs.template).toBe('user-request-confirmation');
    expect(callArgs.to).toBe('laura@external.org');
    expect(callArgs.variables.fullName).toBe('Laura Méndez');
  });

  it('sendWelcomeUser debe enviar plantilla welcome-user con URL de activación', async () => {
    const { emailService, mockMailer } = createService();

    const result = await emailService.sendWelcomeUser({
      to: { email: 'nuevo@sigha.cr', firstName: 'Carlos' },
      roleName: 'Enfermero',
      activationUrl: 'https://sigha.cr/activate?token=abc',
    });

    expect(result.success).toBe(true);
    const callArgs = (mockMailer.sendMail as any).mock.calls[0][0];
    expect(callArgs.template).toBe('welcome-user');
    expect(callArgs.to).toBe('nuevo@sigha.cr');
    expect(callArgs.variables.activationUrl).toBe('https://sigha.cr/activate?token=abc');
  });

  it('sendEmailVerification debe enviar plantilla email-verification con código de verificación', async () => {
    const { emailService, mockMailer } = createService();

    const result = await emailService.sendEmailVerification({
      to: { email: 'verificar@sigha.cr', firstName: 'Ana' },
      code: '87654321',
    });

    expect(result.success).toBe(true);
    const callArgs = (mockMailer.sendMail as any).mock.calls[0][0];
    expect(callArgs.template).toBe('email-verification');
    expect(callArgs.variables.code).toBe('8765 4321');
  });
});
