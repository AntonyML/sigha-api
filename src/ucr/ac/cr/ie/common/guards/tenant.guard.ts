import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../decorators/skip-tenant.decorator';
import { OrganizationMember } from '../../domain/organizations/organization-member.entity';
import { applyTenantDatabaseContext } from '../tenant/tenant-context';

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
  constructor(
    private readonly reflector: Reflector,
    @Inject('DataSource') private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const orgId = Number(user?.orgId);
    const userId = Number(user?.userId ?? user?.id);
    if (!Number.isSafeInteger(orgId) || orgId <= 0 || !Number.isSafeInteger(userId) || userId <= 0) {
      throw new ForbiddenException(
        'Se requiere una organización activa en la sesión para acceder a este recurso de negocio',
      );
    }

    const member = await this.dataSource.transaction(async (manager) => {
      await applyTenantDatabaseContext(
        (sql, parameters) => manager.query(sql, parameters),
        orgId,
        userId,
      );
      return manager.getRepository(OrganizationMember).findOne({
        where: { organizationId: orgId, userId },
        select: { organizationId: true, userId: true },
      });
    });
    if (!member) {
      throw new ForbiddenException('El usuario no pertenece a la organización activa');
    }

    request.activeOrgId = orgId;
    return true;
  }
}
