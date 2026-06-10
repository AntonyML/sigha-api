import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { ResendService } from './resend.service';

describe('ResendService', () => {
  const buildModule = async (env: Record<string, string | undefined>) => {
    const configService = {
      get: jest.fn((key: string) => env[key]),
    } as unknown as ConfigService;
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ResendService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    return moduleRef.get(ResendService);
  };

  it('is disabled when RESEND_API_KEY is missing', async () => {
    const service = await buildModule({ RESEND_FROM_EMAIL: 'noreply@example.com' });
    expect(service.isEnabled()).toBe(false);
  });

  it('is disabled when RESEND_FROM_EMAIL is missing', async () => {
    const service = await buildModule({ RESEND_API_KEY: 're_test' });
    expect(service.isEnabled()).toBe(false);
  });

  it('is enabled when both env vars are present', async () => {
    const service = await buildModule({
      RESEND_API_KEY: 're_test',
      RESEND_FROM_EMAIL: 'noreply@example.com',
      RESEND_FROM_NAME: 'Test Sender',
    });
    expect(service.isEnabled()).toBe(true);
    expect(service.getFromAddress()).toBe('Test Sender <noreply@example.com>');
  });

  it('throws InternalServerErrorException when sending while disabled', async () => {
    const service = await buildModule({});
    await expect(
      service.send({
        to: 'foo@bar.com',
        subject: 'x',
        html: '<p>x</p>',
        text: 'x',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
