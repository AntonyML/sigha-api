import { AuditReportType } from '../../domain/audit';

export interface AuditReportResponse {
  id: number;
  auditNumber: number;
  type: AuditReportType;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  generatedBy: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AuditReportDetailResponse extends AuditReportResponse {
  data: any[];
  totalRecords: number;
}

export interface GenerateAuditReportResponse {
  success: boolean;
  message: string;
  report: AuditReportResponse;
  dataCount: number;
}
