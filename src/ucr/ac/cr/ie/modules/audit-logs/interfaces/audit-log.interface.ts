import { AuditLogAction, AuditEntity } from '../../../domain/audit-logs';

export interface AuditLogResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: AuditLogAction;
  entityName: AuditEntity;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
}

export interface PaginatedAuditLogsResponse {
  logs: AuditLogResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}