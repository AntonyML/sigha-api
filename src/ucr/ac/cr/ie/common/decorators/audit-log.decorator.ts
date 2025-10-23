import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../../domain/audit';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogConfig {
  action: AuditAction;
  tableName?: string;
  description?: string;
}

export const AuditLog = (config: AuditLogConfig) => SetMetadata(AUDIT_LOG_KEY, config);
