import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ResendService } from './resend.service';
import { buildPasswordResetHtml, buildPasswordResetText } from './templates/password-reset.template';
import { buildBackupCodesHtml, buildBackupCodesText } from './templates/backup-codes-2fa.template';

describe('EmailService', () => {
  let service: EmailService;
  let resend: { send: jest.Mock };

  beforeEach(async () => {
    resend = { send: jest.fn() };
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ResendService, useValue: resend },
      ],
    }).compile();
    service = moduleRef.get(EmailService);
  });

  describe('sendPasswordReset', () => {
    it('calls resend.send and returns success on happy path', async () => {
      resend.send.mockResolvedValue({ success: true, messageId: 'msg-1' });
      const result = await service.sendPasswordReset({
        to: { email: 'a@b.c', firstName: 'Ana' },
        code: '12345678',
        expirationLabel: '15 minutos',
      });
      expect(result.success).toBe(true);
      expect(resend.send).toHaveBeenCalledTimes(1);
      const call = resend.send.mock.calls[0][0];
      expect(call.to).toBe('a@b.c');
      expect(call.subject).toMatch(/Recuperación de contraseña/);
      expect(call.html).toContain('1234 5678');
      expect(call.text).toContain('1234 5678');
    });

    it('returns error result when resend fails', async () => {
      resend.send.mockRejectedValue(new Error('boom'));
      const result = await service.sendPasswordReset({
        to: { email: 'a@b.c', firstName: 'Ana' },
        code: '12345678',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('boom');
    });

    it('throws when recipient is missing', async () => {
      await expect(
        service.sendPasswordReset({ to: { email: '', firstName: '' }, code: 'x' }),
      ).rejects.toThrow(/destinatario/);
    });

    it('throws when code is missing', async () => {
      await expect(
        service.sendPasswordReset({ to: { email: 'a@b.c', firstName: 'Ana' }, code: '' }),
      ).rejects.toThrow(/c[oó]digo/);
    });
  });

  describe('sendBackupCodes', () => {
    it('calls resend.send with 8 codes on happy path', async () => {
      resend.send.mockResolvedValue({ success: true, messageId: 'msg-2' });
      const codes = ['AAAA-1111', 'BBBB-2222', 'CCCC-3333', 'DDDD-4444', 'EEEE-5555', 'FFFF-6666', 'GGGG-7777', 'HHHH-8888'];
      const result = await service.sendBackupCodes({
        to: { email: 'a@b.c', firstName: 'Ana' },
        codes,
      });
      expect(result.success).toBe(true);
      const call = resend.send.mock.calls[0][0];
      expect(call.html).toContain('AAAA-1111');
      expect(call.text).toContain('BBBB-2222');
    });

    it('returns error result when resend fails', async () => {
      resend.send.mockRejectedValue(new Error('rate limited'));
      const result = await service.sendBackupCodes({
        to: { email: 'a@b.c', firstName: 'Ana' },
        codes: ['A-A', 'B-B', 'C-C', 'D-D', 'E-E', 'F-F', 'G-G', 'H-H'],
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('rate limited');
    });

    it('throws when codes array is empty', async () => {
      await expect(
        service.sendBackupCodes({ to: { email: 'a@b.c', firstName: 'Ana' }, codes: [] }),
      ).rejects.toThrow(/al menos un c[oó]digo/);
    });
  });
});

describe('Password-reset template', () => {
  it('formats 8-digit code with a space in the middle', () => {
    const html = buildPasswordResetHtml({ to: { email: 'a@b.c', firstName: 'Ana' }, code: '12345678' });
    expect(html).toContain('1234 5678');
  });

  it('escapes HTML in the recipient name', () => {
    const html = buildPasswordResetHtml({ to: { email: 'a@b.c', firstName: '<script>' }, code: '12345678' });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('renders text version with formatted code', () => {
    const text = buildPasswordResetText({ to: { email: 'a@b.c', firstName: 'Ana' }, code: '12345678' });
    expect(text).toContain('1234 5678');
  });
});

describe('Backup-codes template', () => {
  it('renders 8 codes in the HTML', () => {
    const codes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const html = buildBackupCodesHtml({ to: { email: 'a@b.c', firstName: 'Ana' }, codes });
    for (const c of codes) {
      expect(html).toContain(c);
    }
  });

  it('throws when codes array is empty', () => {
    expect(() => buildBackupCodesHtml({ to: { email: 'a@b.c', firstName: 'Ana' }, codes: [] })).toThrow();
  });

  it('renders all 8 codes in the text version', () => {
    const codes = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6', 'G7', 'H8'];
    const text = buildBackupCodesText({ to: { email: 'a@b.c', firstName: 'Ana' }, codes });
    for (const c of codes) {
      expect(text).toContain(c);
    }
  });
});
