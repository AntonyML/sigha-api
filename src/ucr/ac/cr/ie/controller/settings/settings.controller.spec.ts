import { describe, expect, it } from 'bun:test';
import { ForbiddenException } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { GlobalSettingsStepUpGuard, RolesGuard } from '../../common/guards';
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
});
