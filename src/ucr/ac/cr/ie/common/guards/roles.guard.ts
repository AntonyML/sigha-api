import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !Array.isArray(user.roles) || user.roles.length === 0) {
            return false;
        }

        // Multi-role: allow access if the user owns at least one of the
        // required roles. RolesGuard remains a coarse "name match" guard
        // for legacy @Roles decorator compatibility; per-action checks
        // go through PermissionService.hasAnyPermission (JWT roleIds).
        return requiredRoles.some((role) => user.roles.includes(role));
    }
}