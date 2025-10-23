export interface AuditHistoryUser {
  userId: number;
  userName: string;
  userEmail: string;
}

export interface AuditHistoryChanges {
  before?: any;
  after?: any;
}

export interface AuditHistoryMetadata {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditHistoryRecord {
  id: number;
  recordId: string;
  entityType: string;
  action: string;
  timestamp: Date;
  user: AuditHistoryUser;
  changes?: AuditHistoryChanges;
  metadata: AuditHistoryMetadata;
  observations?: string;
}

export interface AuditHistoryPagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export interface AuditHistoryResponse {
  success: boolean;
  data: {
    records: AuditHistoryRecord[];
    pagination: AuditHistoryPagination;
  };
}
