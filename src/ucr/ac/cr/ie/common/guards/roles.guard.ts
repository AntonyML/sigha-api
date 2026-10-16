import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PlatformRole } from '../../domain/auth/core/user.entity';
import { RoleType } from '../../domain/auth/core/role.entity';

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
        if (!user) {
            return false;
        }

        const effectiveRoles = new Set<string>([
            ...(Array.isArray(user.orgRoles) ? user.orgRoles : []),
            ...(Array.isArray(user.roles) ? user.roles : []),
        ]);

        if (user.platformRole === PlatformRole.PLATFORM_OWNER) {
            effectiveRoles.add(RoleType.SUPER_ADMIN);
        }

        if (effectiveRoles.size === 0) {
            return false;
        }

        return requiredRoles.some((role) => effectiveRoles.has(role));
    }
}