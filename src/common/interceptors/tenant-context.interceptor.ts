import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../ucr/ac/cr/ie/common/decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../../ucr/ac/cr/ie/common/decorators/skip-tenant.decorator';
import {
  applyTenantDatabaseContext,
  runWithTenantContext,
} from '../../ucr/ac/cr/ie/common/tenant/tenant-context';
import { DataSource } from 'typeorm';
import { defer, from, lastValueFrom } from 'rxjs';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject('DataSource')
    private readonly dataSource: DataSource,
  ) {}

  intercept(execution: ExecutionContext, next: CallHandler) {
    if (execution.getType() !== 'http') return next.handle();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      execution.getHandler(),
      execution.getClass(),
    ]);
    const skipTenant = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_KEY, [
      execution.getHandler(),
      execution.getClass(),
    ]);
    if (isPublic || skipTenant) return next.handle();

    const request = execution.switchToHttp().getRequest();
    const tenantId = Number(request.activeOrgId ?? request.user?.orgId);
    const userId = Number(request.user?.userId ?? request.user?.id);
    if (!Number.isSafeInteger(tenantId) || tenantId <= 0 || !Number.isSafeInteger(userId) || userId <= 0) {
      throw new ForbiddenException('Se requiere una organización y un usuario válidos para acceder a este recurso');
    }

    return defer(() => from(this.dataSource.transaction(async (manager) => {
      const queryRunner = manager.queryRunner;
      if (!queryRunner) throw new Error('Tenant context requires a transactional query runner');
      await applyTenantDatabaseContext(
        (sql, parameters) => manager.query(sql, parameters),
        tenantId,
        userId,
      );
      return runWithTenantContext(
        { tenantId, userId, manager, queryRunner },
        () => lastValueFrom(next.handle()),
      );
    })));
  }
}
