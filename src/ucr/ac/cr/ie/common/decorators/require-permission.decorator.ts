import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionModule } from '../../domain/permissions';

export const REQUIRED_PERMISSION_KEY = 'required-module-permission';
export interface RequiredModulePermission {
  module: PermissionModule;
  action: PermissionAction;
}

export const RequirePermission = (module: PermissionModule, action: PermissionAction) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, { module, action } satisfies RequiredModulePermission);
