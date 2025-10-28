import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Like, In } from 'typeorm';
import { ActivityLog, ActivityType, ActivitySeverity } from '../../domain/activity-logs/activity-log.entity';

@Injectable()
export class ActivityLogsRepository {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  /**
   * Crea un nuevo log de actividad
   */
  async createActivityLog(activityData: {
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
  }): Promise<ActivityLog> {
    const activityLog = this.activityLogRepository.create({
      userId: activityData.userId,
      activityType: activityData.activityType,
      severity: activityData.severity || ActivitySeverity.LOW,
      description: activityData.description,
      entityType: activityData.entityType,
      entityId: activityData.entityId,
      oldValues: activityData.oldValues,
      newValues: activityData.newValues,
      metadata: activityData.metadata,
      ipAddress: activityData.ipAddress,
      userAgent: activityData.userAgent,
      sessionId: activityData.sessionId,
      correlationId: activityData.correlationId,
      requestId: activityData.requestId,
      endpoint: activityData.endpoint,
      method: activityData.method,
      executionTimeMs: activityData.executionTimeMs,
      success: activityData.success !== false,
      errorMessage: activityData.errorMessage,
      tags: activityData.tags,
    });

    return await this.activityLogRepository.save(activityLog);
  }

  /**
   * Obtiene logs de actividad con filtros y paginación
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
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.activityType) {
      where.activityType = filters.activityType;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters?.sessionId) {
      where.sessionId = filters.sessionId;
    }

    if (filters?.correlationId) {
      where.correlationId = filters.correlationId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    if (filters?.success !== undefined) {
      where.success = filters.success;
    }

    if (filters?.tags && filters.tags.length > 0) {
      // Para búsqueda en arrays JSON, necesitamos una consulta más compleja
      // Por simplicidad, usaremos una condición básica
    }

    const queryBuilder = this.activityLogRepository
      .createQueryBuilder('activity')
      .where(where);

    // Búsqueda de texto
    if (filters?.search) {
      queryBuilder.andWhere(
        '(activity.description ILIKE :search OR activity.errorMessage ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Filtro de tags (búsqueda simple en JSON)
    if (filters?.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('activity.tags::text ILIKE ANY(:tags)', {
        tags: filters.tags.map(tag => `%${tag}%`)
      });
    }

    const [logs, total] = await queryBuilder
      .orderBy('activity.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      total,
      page,
      totalPages,
    };
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
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    // Total de actividades
    const totalActivities = await this.activityLogRepository.count({ where });

    // Actividades por tipo
    const activitiesByType = await this.activityLogRepository
      .createQueryBuilder('activity')
      .select('activity.activityType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('activity.activityType')
      .getRawMany();

    const activitiesByTypeMap = activitiesByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Actividades por severidad
    const activitiesBySeverity = await this.activityLogRepository
      .createQueryBuilder('activity')
      .select('activity.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('activity.severity')
      .getRawMany();

    const activitiesBySeverityMap = activitiesBySeverity.reduce((acc, item) => {
      acc[item.severity] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Actividades por usuario
    const activitiesByUser = await this.activityLogRepository
      .createQueryBuilder('activity')
      .select('activity.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .andWhere('activity.userId IS NOT NULL')
      .groupBy('activity.userId')
      .getRawMany();

    const activitiesByUserMap = activitiesByUser.reduce((acc, item) => {
      acc[item.userId] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Tasa de éxito
    const successCount = await this.activityLogRepository.count({
      where: { ...where, success: true },
    });

    const successRate = totalActivities > 0 ? (successCount / totalActivities) * 100 : 0;

    // Tiempo promedio de ejecución
    const executionTimeStats = await this.activityLogRepository
      .createQueryBuilder('activity')
      .select('AVG(activity.executionTimeMs)', 'avg')
      .where(where)
      .andWhere('activity.executionTimeMs IS NOT NULL')
      .getRawOne();

    const averageExecutionTime = executionTimeStats?.avg ? parseFloat(executionTimeStats.avg) : 0;

    // Actividades recientes
    const recentActivities = await this.activityLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Top entidades modificadas
    const topEntities = await this.activityLogRepository
      .createQueryBuilder('activity')
      .select('activity.entityType', 'entityType')
      .addSelect('activity.entityId', 'entityId')
      .addSelect('COUNT(*)', 'activityCount')
      .where(where)
      .andWhere('activity.entityType IS NOT NULL')
      .andWhere('activity.entityId IS NOT NULL')
      .groupBy('activity.entityType')
      .addGroupBy('activity.entityId')
      .orderBy('activityCount', 'DESC')
      .limit(10)
      .getRawMany();

    const topEntitiesFormatted = topEntities.map(item => ({
      entityType: item.entityType,
      entityId: parseInt(item.entityId),
      activityCount: parseInt(item.activityCount),
    }));

    return {
      totalActivities,
      activitiesByType: activitiesByTypeMap,
      activitiesBySeverity: activitiesBySeverityMap,
      activitiesByUser: activitiesByUserMap,
      successRate,
      averageExecutionTime,
      recentActivities,
      topEntities: topEntitiesFormatted,
    };
  }

  /**
   * Obtiene logs de actividad de un usuario específico
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
    return this.getActivityLogs({
      ...filters,
      userId,
    });
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
    return this.getActivityLogs({
      ...filters,
      sessionId,
    });
  }

  /**
   * Busca logs de actividad por texto
   */
  async searchActivityLogs(
    searchText: string,
    filters?: {
      userId?: number;
      activityType?: ActivityType;
      limit?: number;
    },
  ): Promise<ActivityLog[]> {
    return this.getActivityLogs({
      ...filters,
      search: searchText,
      limit: filters?.limit || 50,
    }).then(result => result.logs);
  }

  /**
   * Elimina logs antiguos según política de retención
   */
  async deleteOldActivityLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.activityLogRepository.delete({
      createdAt: LessThanOrEqual(cutoffDate),
    });

    return result.affected || 0;
  }

  /**
   * Obtiene logs de actividad por correlación ID
   */
  async getActivityLogsByCorrelationId(correlationId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { correlationId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Obtiene resumen de actividad por día
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
    const result = await this.activityLogRepository
      .createQueryBuilder('activity')
      .select("DATE(activity.createdAt)", 'date')
      .addSelect('COUNT(*)', 'totalActivities')
      .addSelect('SUM(CASE WHEN activity.success = true THEN 1 ELSE 0 END)', 'successfulActivities')
      .addSelect('SUM(CASE WHEN activity.success = false THEN 1 ELSE 0 END)', 'failedActivities')
      .where('activity.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy("DATE(activity.createdAt)")
      .orderBy("DATE(activity.createdAt)", 'ASC')
      .getRawMany();

    // Para cada día, obtener actividades por tipo
    const summary = await Promise.all(
      result.map(async (day) => {
        const dayStart = new Date(day.date);
        const dayEnd = new Date(day.date);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const activitiesByType = await this.activityLogRepository
          .createQueryBuilder('activity')
          .select('activity.activityType', 'type')
          .addSelect('COUNT(*)', 'count')
          .where('activity.createdAt BETWEEN :dayStart AND :dayEnd', {
            dayStart,
            dayEnd,
          })
          .groupBy('activity.activityType')
          .getRawMany();

        const activitiesByTypeMap = activitiesByType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, {} as Record<string, number>);

        return {
          date: day.date,
          totalActivities: parseInt(day.totalActivities),
          successfulActivities: parseInt(day.successfulActivities || '0'),
          failedActivities: parseInt(day.failedActivities || '0'),
          activitiesByType: activitiesByTypeMap,
        };
      })
    );

    return summary;
  }
}