import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../decorators/skip-tenant.decorator';

/**
 * Guard that enforces multi-tenant scoping on business endpoints.
 * Requires that an authenticated request contains an active `orgId` claim in its session/JWT.
 *
 * Exemptions:
 * - Endpoints decorated with `@Public()`
 * - Endpoints or controllers decorated with `@SkipTenant()`
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const orgId = user?.orgId;
    if (orgId === undefined || orgId === null || Number.isNaN(Number(orgId)) || Number(orgId) <= 0) {
      throw new ForbiddenException(
        'Se requiere una organización activa en la sesión para acceder a este recurso de negocio',
      );
    }

    request.activeOrgId = Number(orgId);
    return true;
  }
}
