import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function createService(env: Record<string, string | undefined> = {}) {
    const mockConfigService = {
      get: (key: string) => env[key],
    } as unknown as ConfigService;
    return new MailerService(mockConfigService);
  }

  it('debe reportar isEnabled=true si MAILER_APP_KEY está configurada', () => {
    const service = createService({
      MAILER_APP_KEY: 'ml_live_test1234567890',
      MAILER_BASE_URL: 'https://mailer.tonyml.com/api/send',
    });
    expect(service.isEnabled()).toBe(true);
  });

  it('debe reportar isEnabled=false si MAILER_APP_KEY está ausente o vacía', () => {
    const service = createService({ MAILER_APP_KEY: '' });
    expect(service.isEnabled()).toBe(false);
  });

  it('sendMail debe lanzar InternalServerErrorException si el servicio no está habilitado', async () => {
    const service = createService({ MAILER_APP_KEY: '' });
    await expect(
      service.sendMail({ to: 'user@test.com', template: 'test', variables: {} }),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('sendMail debe enviar petición HTTP con header x-app-key y body to_override', async () => {
    let capturedUrl = '';
    let capturedOptions: any = null;

    globalThis.fetch = mock(async (url: any, opts: any) => {
      capturedUrl = String(url);
      capturedOptions = opts;
      return new Response(
        JSON.stringify({ success: true, id: 'msg-12345', template: 'password-reset' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }) as any;

    const service = createService({
      MAILER_APP_KEY: 'ml_live_test_key',
      MAILER_BASE_URL: 'https://mailer.tonyml.com/api/send',
    });

    const result = await service.sendMail({
      to: 'paciente@sigha.cr',
      template: 'password-reset',
      variables: { firstName: 'Juan', code: '1234 5678' },
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-12345');
    expect(capturedUrl).toBe('https://mailer.tonyml.com/api/send');
    expect(capturedOptions.method).toBe('POST');
    expect(capturedOptions.headers['x-app-key']).toBe('ml_live_test_key');

    const parsedBody = JSON.parse(capturedOptions.body);
    expect(parsedBody.to_override).toBe('paciente@sigha.cr');
    expect(parsedBody.template).toBe('password-reset');
    expect(parsedBody.variables.firstName).toBe('Juan');
  });

  it('sendMail debe manejar errores de respuesta de Mailbridge', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({ success: false, error: 'API key inválida' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      );
    }) as any;

    const service = createService({
      MAILER_APP_KEY: 'ml_live_bad_key',
    });

    await expect(
      service.sendMail({ to: 'admin@sigha.cr', template: 'user-request' }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
