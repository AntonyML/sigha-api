import { describe, expect, it, mock } from 'bun:test';
import { ForbiddenException } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { GlobalSettingsStepUpGuard, RolesGuard } from '../../common/guards';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { RoleType } from '../../domain/auth/core/role.entity';

describe('SettingsController - global settings security', () => {
  it('requires role authorization on settings routes and step-up on global reads/writes', () => {
    const handler = SettingsController.prototype.getGlobalSettings;
    const guards = Reflect.getMetadata('__guards__', handler) as unknown[];
    const roles = Reflect.getMetadata('roles', handler) as string[];
    const controllerGuards = Reflect.getMetadata('__guards__', SettingsController) as unknown[];

    expect(controllerGuards).toContain(RolesGuard);
    expect(guards).toContain(GlobalSettingsStepUpGuard);
    expect(roles).toEqual([RoleType.SUPER_ADMIN, RoleType.ADMIN]);
  });

  it('blocks legacy category routes from reading or writing the global category', async () => {
    const controller = new SettingsController({} as any, {} as any, {} as any);

    await expect(controller.get('global')).rejects.toThrow(ForbiddenException);
    await expect(controller.upsert('global', { category: 'global', settings: { appName: 'Bypass' } })).rejects.toThrow(ForbiddenException);
  });

  it('exposes platform branding publicly without roles or step-up guards', async () => {
    const getGlobalSettings = mock(async () => ({
      id: 9,
      category: 'global',
      settings: { appName: 'SIGHA Plataforma', logoUrl: 'https://cdn.test/logo.png' },
    }));
    const controller = new SettingsController({ getGlobalSettings } as any, {} as any, {} as any);
    const handler = SettingsController.prototype.getPublicGlobalSettings;
    const guards = (Reflect.getMetadata('__guards__', handler) as unknown[] | undefined) ?? [];

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, handler)).toBe(true);
    expect(Reflect.getMetadata('roles', handler)).toBeUndefined();
    expect(guards).not.toContain(GlobalSettingsStepUpGuard);
    await expect(controller.getPublicGlobalSettings()).resolves.toEqual({
      appName: 'SIGHA Plataforma',
      logoUrl: 'https://cdn.test/logo.png',
    });
  });

  it('falls back to the SIGHA default when the public branding has invalid values', async () => {
    const getGlobalSettings = mock(async () => ({
      id: 0,
      category: 'global',
      settings: { appName: '   ', logoUrl: 42 },
    }));
    const controller = new SettingsController({ getGlobalSettings } as any, {} as any, {} as any);

    await expect(controller.getPublicGlobalSettings()).resolves.toEqual({
      appName: 'SIGHA',
      logoUrl: null,
    });
  });
});
