import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType, ActivitySeverity } from '../../domain/activity-logs/activity-log.entity';
import { ActivityLogsRepository } from '../../repository/activity-logs/activity-logs.repository';

export interface ActivityLogData {
  userId?: number;
  activityType: ActivityType;
  severity?: ActivitySeverity;
  description?: string;
  entityType?: string;
  entityId?: number;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  executionTimeMs?: number;
  success?: boolean;
  errorMessage?: string;
  tags?: string[];
}

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly activityLogsRepository: ActivityLogsRepository,
  ) {}

  /**
   * Registra una nueva actividad
   */
  async logActivity(activityData: ActivityLogData): Promise<ActivityLog> {
    try {
      const activityLog = await this.activityLogsRepository.createActivityLog(activityData);

      // Log de actividades críticas
      if (activityData.severity === ActivitySeverity.CRITICAL ||
          activityData.severity === ActivitySeverity.HIGH) {
        this.logger.warn(`Critical activity logged: ${activityData.activityType} - ${activityData.description}`, {
          activityId: activityLog.id,
          userId: activityData.userId,
          entityType: activityData.entityType,
          entityId: activityData.entityId,
        });
      }

      return activityLog;
    } catch (error) {
      this.logger.error('Failed to log activity', error);
      throw error;
    }
  }

  /**
   * Registra actividad de login
   */
  async logLogin(
    userId: number,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      correlationId?: string;
      success?: boolean;
      errorMessage?: string;
    },
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      activityType: ActivityType.LOGIN,
      severity: ActivitySeverity.MEDIUM,
      description: `User login ${metadata?.success === false ? 'failed' : 'successful'}`,
      success: metadata?.success !== false,
      errorMessage: metadata?.errorMessage,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      sessionId: metadata?.sessionId,
      correlationId: metadata?.correlationId,
      tags: ['authentication', 'login'],
    });
  }

  /**
   * Registra actividad de logout
   */
  async logLogout(
    userId: number,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      correlationId?: string;
    },
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      activityType: ActivityType.LOGOUT,
      severity: ActivitySeverity.LOW,
      description: 'User logout',
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      sessionId: metadata?.sessionId,
      correlationId: metadata?.correlationId,
      tags: ['authentication', 'logout'],
    });
  }

  /**
   * Registra cambio de contraseña
   */
  async logPasswordChange(
    userId: number,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      success?: boolean;
      errorMessage?: string;
    },
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      activityType: ActivityType.PASSWORD_CHANGE,
      severity: ActivitySeverity.HIGH,
      description: `Password change ${metadata?.success === false ? 'failed' : 'successful'}`,
      success: metadata?.success !== false,
      errorMessage: metadata?.errorMessage,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      correlationId: metadata?.correlationId,
      tags: ['security', 'password'],
    });
  }

  /**
   * Registra modificación de datos
   */
  async logDataModification(
    userId: number,
    entityType: string,
    entityId: number,
    action: 'create' | 'update' | 'delete',
    oldValues?: any,
    newValues?: any,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      description?: string;
    },
  ): Promise<ActivityLog> {
    const activityTypeMap = {
      create: ActivityType.DATA_MODIFY,
      update: ActivityType.DATA_MODIFY,
      delete: ActivityType.DATA_DELETE,
    };

    const severityMap = {
      create: ActivitySeverity.MEDIUM,
      update: ActivitySeverity.MEDIUM,
      delete: ActivitySeverity.HIGH,
    };

    return this.logActivity({
      userId,
      activityType: activityTypeMap[action],
      severity: severityMap[action],
      description: metadata?.description || `${action.toUpperCase()} operation on ${entityType}`,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      correlationId: metadata?.correlationId,
      tags: ['data', action, entityType.toLowerCase()],
    });
  }

  /**
   * Registra acceso a datos
   */
  async logDataAccess(
    userId: number,
    entityType: string,
    entityId: number,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      description?: string;
      endpoint?: string;
      method?: string;
    },
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      activityType: ActivityType.DATA_ACCESS,
      severity: ActivitySeverity.LOW,
      description: metadata?.description || `Access to ${entityType}`,
      entityType,
      entityId,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      correlationId: metadata?.correlationId,
      endpoint: metadata?.endpoint,
      method: metadata?.method,
      tags: ['data', 'access', entityType.toLowerCase()],
    });
  }

  /**
   * Registra actividad de API
   */
  async logApiActivity(
    userId: number,
    endpoint: string,
    method: string,
    statusCode: number,
    executionTime: number,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      requestId?: string;
      success?: boolean;
      errorMessage?: string;
    },
  ): Promise<ActivityLog> {
    const severity = statusCode >= 500 ? ActivitySeverity.HIGH :
                    statusCode >= 400 ? ActivitySeverity.MEDIUM :
                    ActivitySeverity.LOW;

    return this.logActivity({
      userId,
      activityType: ActivityType.API_ACCESS,
      severity,
      description: `API call: ${method} ${endpoint} (${statusCode})`,
      endpoint,
      method,
      executionTimeMs: executionTime,
      success: metadata?.success !== false,
      errorMessage: metadata?.errorMessage,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      correlationId: metadata?.correlationId,
      requestId: metadata?.requestId,
      tags: ['api', method.toLowerCase(), `status-${statusCode}`],
    });
  }

  /**
   * Registra alerta de seguridad
   */
  async logSecurityAlert(
    userId: number,
    alertType: string,
    description: string,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      correlationId?: string;
      severity?: ActivitySeverity;
      additionalData?: any;
    },
  ): Promise<ActivityLog> {
    return this.logActivity({
      userId,
      activityType: ActivityType.SECURITY_ALERT,
      severity: metadata?.severity || ActivitySeverity.CRITICAL,
      description: `Security alert: ${alertType} - ${description}`,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      correlationId: metadata?.correlationId,
      metadata: metadata?.additionalData,
      tags: ['security', 'alert', alertType.toLowerCase()],
    });
  }

  /**
   * Obtiene logs de actividad con filtros
   */
  async getActivityLogs(filters?: {
    page?: number;
    limit?: number;
    userId?: number;
    activityType?: ActivityType;
    severity?: ActivitySeverity;
    entityType?: string;
    entityId?: number;
    sessionId?: string;
    correlationId?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
    tags?: string[];
    search?: string;
  }): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.activityLogsRepository.getActivityLogs(filters);
  }

  /**
   * Obtiene estadísticas de actividad
   */
  async getActivityStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }): Promise<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    activitiesBySeverity: Record<string, number>;
    activitiesByUser: Record<string, number>;
    successRate: number;
    averageExecutionTime: number;
    recentActivities: ActivityLog[];
    topEntities: Array<{
      entityType: string;
      entityId: number;
      activityCount: number;
    }>;
  }> {
    return this.activityLogsRepository.getActivityStatistics(filters);
  }

  /**
   * Obtiene logs de actividad de un usuario
   */
  async getUserActivityLogs(
    userId: number,
    filters?: {
      page?: number;
      limit?: number;
      activityType?: ActivityType;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.activityLogsRepository.getUserActivityLogs(userId, filters);
  }

  /**
   * Obtiene logs de actividad por sesión
   */
  async getSessionActivityLogs(
    sessionId: string,
    filters?: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.activityLogsRepository.getSessionActivityLogs(sessionId, filters);
  }

  /**
   * Busca logs de actividad
   */
  async searchActivityLogs(
    searchText: string,
    filters?: {
      userId?: number;
      activityType?: ActivityType;
      limit?: number;
    },
  ): Promise<ActivityLog[]> {
    return this.activityLogsRepository.searchActivityLogs(searchText, filters);
  }

  /**
   * Obtiene logs por correlación ID
   */
  async getActivityLogsByCorrelationId(correlationId: string): Promise<ActivityLog[]> {
    return this.activityLogsRepository.getActivityLogsByCorrelationId(correlationId);
  }

  /**
   * Obtiene resumen de actividad por fecha
   */
  async getActivitySummaryByDate(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{
    date: string;
    totalActivities: number;
    successfulActivities: number;
    failedActivities: number;
    activitiesByType: Record<string, number>;
  }>> {
    return this.activityLogsRepository.getActivitySummaryByDate(startDate, endDate);
  }

  /**
   * Elimina logs antiguos
   */
  async cleanupOldLogs(retentionDays: number): Promise<number> {
    return this.activityLogsRepository.deleteOldActivityLogs(retentionDays);
  }

  /**
   * Obtiene actividades recientes de un usuario
   */
  async getRecentUserActivities(
    userId: number,
    limit: number = 10,
  ): Promise<ActivityLog[]> {
    const result = await this.getUserActivityLogs(userId, {
      limit,
      page: 1,
    });
    return result.logs;
  }

  /**
   * Verifica si un usuario tiene actividad sospechosa
   */
  async checkSuspiciousActivity(
    userId: number,
    timeframeHours: number = 24,
  ): Promise<{
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    recentFailedActivities: number;
    unusualPatterns: string[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - timeframeHours);

    const activities = await this.getUserActivityLogs(userId, {
      startDate,
      endDate,
      limit: 100,
    });

    const failedActivities = activities.logs.filter(log => !log.success);
    const securityAlerts = activities.logs.filter(log =>
      log.activityType === ActivityType.SECURITY_ALERT
    );

    const indicators: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Verificar múltiples fallos de login
    if (failedActivities.filter(log => log.activityType === ActivityType.LOGIN).length > 5) {
      indicators.push('Multiple failed login attempts');
      riskLevel = 'medium';
    }

    // Verificar alertas de seguridad
    if (securityAlerts.length > 0) {
      indicators.push(`${securityAlerts.length} security alerts`);
      riskLevel = 'high';
    }

    // Verificar actividad inusual (muchos accesos a datos sensibles)
    const dataAccessActivities = activities.logs.filter(log =>
      log.activityType === ActivityType.DATA_ACCESS &&
      log.tags?.includes('sensitive')
    );

    if (dataAccessActivities.length > 20) {
      indicators.push('Unusual data access patterns');
      riskLevel = riskLevel === 'high' ? 'critical' : 'high';
    }

    // Verificar cambios de contraseña fallidos
    const failedPasswordChanges = failedActivities.filter(log =>
      log.activityType === ActivityType.PASSWORD_CHANGE
    );

    if (failedPasswordChanges.length > 3) {
      indicators.push('Multiple failed password changes');
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
    }

    return {
      isSuspicious: riskLevel !== 'low',
      riskLevel,
      indicators,
      recentFailedActivities: failedActivities.length,
      unusualPatterns: [], // Could be expanded with more complex pattern analysis
    };
  }
}