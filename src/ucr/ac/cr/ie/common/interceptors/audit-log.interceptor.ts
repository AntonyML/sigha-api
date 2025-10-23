import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_LOG_KEY, AuditLogConfig } from '../decorators/audit-log.decorator';
import { AuditService } from '../../services/audit';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditConfig = this.reflector.get<AuditLogConfig>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const recordId = response?.id || response?.data?.id;
          const description = auditConfig.description || this.generateDescription(auditConfig, request);

          await this.auditService.logAction(
            userId,
            auditConfig.action,
            auditConfig.tableName,
            recordId,
            description,
          );
        } catch (error) {
          console.error('Error logging audit action:', error);
        }
      }),
    );
  }

  private generateDescription(config: AuditLogConfig, request: any): string {
    const method = request.method;
    const path = request.url;
    return `${method} ${path} - ${config.action}`;
  }
}
