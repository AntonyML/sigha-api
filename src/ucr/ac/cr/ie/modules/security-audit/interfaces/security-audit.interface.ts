import { SecurityEventType, SecuritySeverity } from '../../../domain/security-audit';

export interface SecurityEventResponse {
  id: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: string;
  description?: string;
  metadata?: any;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: number;
  resolverName?: string;
  createdAt: Date;
}

export interface LoginAttemptResponse {
  id: number;
  userId?: number;
  userName?: string;
  email: string;
  ipAddress?: string;
  attemptSuccessful: boolean;
  failureReason?: string;
  attemptedAt: Date;
}

export interface PaginatedSecurityEventsResponse {
  events: SecurityEventResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedLoginAttemptsResponse {
  attempts: LoginAttemptResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SecurityStatisticsResponse {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  recentFailedLogins: number;
  suspiciousActivities: number;
  resolvedEvents: number;
  unresolvedEvents: number;
}