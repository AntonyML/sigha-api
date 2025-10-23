import { AuditAction } from '../../domain/audit';

export interface DigitalRecordResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  action: AuditAction;
  tableName?: string;
  recordId?: number;
  description?: string;
  timestamp: Date;
}

export interface PaginatedDigitalRecordsResponse {
  records: DigitalRecordResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
