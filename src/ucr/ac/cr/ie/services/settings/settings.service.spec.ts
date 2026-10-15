import { describe, expect, it, mock } from 'bun:test';
import { SettingsService } from './settings.service';

describe('SettingsService - global settings', () => {
  it('reads legacy platform identity as a compatibility default', async () => {
    const settingsRepo = {
      findOne: mock(async ({ where }: { where: { category: string } }) => {
        if (where.category === 'general') {
          return { id: 5, category: 'general', settings: { appName: 'SIGHA Central', logoUrl: 'https://cdn.test/logo.png' } };
        }
        return null;
      }),
      create: mock((value: unknown) => value),
      save: mock(async (value: unknown) => value),
    };
    const service = new SettingsService(settingsRepo as any);

    const result = await service.getGlobalSettings();

    expect(result).toEqual({
      id: 0,
      category: 'global',
      settings: { appName: 'SIGHA Central', logoUrl: 'https://cdn.test/logo.png' },
    } as any);
  });

  it('updates platform name while preserving a logo when it is omitted', async () => {
    const existing = {
      id: 9,
      category: 'global',
      settings: { appName: 'SIGHA', logoUrl: 'https://cdn.test/current.png' },
    };
    const settingsRepo = {
      findOne: mock(async () => existing),
      create: mock((value: unknown) => value),
      save: mock(async (value: any) => value),
    };
    const service = new SettingsService(settingsRepo as any);

    const result = await service.upsertGlobalSettings({ appName: '  SIGHA Plataforma  ' });

    expect(result.settings).toEqual({ appName: 'SIGHA Plataforma', logoUrl: 'https://cdn.test/current.png' });
    expect(settingsRepo.save).toHaveBeenCalledWith(existing as any);
  });

  it('does not let the legacy general endpoint change platform identity', async () => {
    const existing = {
      id: 5,
      category: 'general',
      settings: { appName: 'SIGHA Central', logoUrl: 'https://cdn.test/logo.png', language: 'es', timezone: 'UTC' },
    };
    const settingsRepo = {
      findOne: mock(async () => existing),
      create: mock((value: unknown) => value),
      save: mock(async (value: any) => value),
    };
    const service = new SettingsService(settingsRepo as any);

    const result = await service.upsert('general', {
      category: 'general',
      settings: {
        appName: 'Atacante',
        logoUrl: 'https://attacker.test/logo.png',
        language: 'en',
        timezone: 'America/Costa_Rica',
      },
    });

    expect(result.settings).toEqual({
      appName: 'SIGHA Central',
      logoUrl: 'https://cdn.test/logo.png',
      language: 'en',
      timezone: 'America/Costa_Rica',
    });
  });
});
