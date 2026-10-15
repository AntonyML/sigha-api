import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../services/permissions/permission.service';
import { REQUIRED_PERMISSION_KEY, RequiredModulePermission } from '../decorators/require-permission.decorator';

@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredModulePermission>(REQUIRED_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const request = context.switchToHttp().getRequest<{ user?: { roleIds?: number[] } }>();
    const roleIds = Array.isArray(request.user?.roleIds) ? request.user.roleIds : [];
    const allowed = await this.permissionService.hasAnyPermission(roleIds, required.module, required.action);
    if (!allowed) throw new ForbiddenException('No tiene permiso para realizar esta acción.');
    return true;
  }
}
