import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SystemEvent, SystemEventType, SystemSeverity } from '../../domain/system-audit/system-event.entity';

@Injectable()
export class SystemAuditRepository {
  constructor(
    @InjectRepository(SystemEvent)
    private readonly systemEventRepository: Repository<SystemEvent>,
  ) {}

  /**
   * Obtiene estadísticas del sistema
   */
  async getSystemStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    eventType?: SystemEventType;
    severity?: SystemSeverity;
    component?: string;
  }): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    eventsByComponent: Record<string, number>;
    averageExecutionTime: number;
    errorRate: number;
    recentEvents: SystemEvent[];
    performanceMetrics: {
      averageResponseTime: number;
      errorRate: number;
      throughput: number;
    };
  }> {
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.component) {
      where.component = filters.component;
    }

    // Total de eventos
    const totalEvents = await this.systemEventRepository.count({ where });

    // Eventos por tipo
    const eventsByType = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('event.eventType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('event.eventType')
      .getRawMany();

    const eventsByTypeMap = eventsByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Eventos por severidad
    const eventsBySeverity = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('event.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('event.severity')
      .getRawMany();

    const eventsBySeverityMap = eventsBySeverity.reduce((acc, item) => {
      acc[item.severity] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Eventos por componente
    const eventsByComponent = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('event.component', 'component')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('event.component')
      .getRawMany();

    const eventsByComponentMap = eventsByComponent.reduce((acc, item) => {
      acc[item.component] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Tiempo promedio de ejecución
    const executionTimeStats = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('AVG(event.executionTimeMs)', 'avg')
      .where(where)
      .andWhere('event.executionTimeMs IS NOT NULL')
      .getRawOne();

    const averageExecutionTime = executionTimeStats?.avg ? parseFloat(executionTimeStats.avg) : 0;

    // Tasa de error
    const errorEvents = await this.systemEventRepository.count({
      where: {
        ...where,
        severity: SystemSeverity.ERROR,
      },
    });

    const criticalEvents = await this.systemEventRepository.count({
      where: {
        ...where,
        severity: SystemSeverity.CRITICAL,
      },
    });

    const errorRate = totalEvents > 0 ? ((errorEvents + criticalEvents) / totalEvents) * 100 : 0;

    // Eventos recientes (últimos 10)
    const recentEvents = await this.systemEventRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Métricas de rendimiento
    const performanceMetrics = await this.getPerformanceMetrics(where);

    return {
      totalEvents,
      eventsByType: eventsByTypeMap,
      eventsBySeverity: eventsBySeverityMap,
      eventsByComponent: eventsByComponentMap,
      averageExecutionTime,
      errorRate,
      recentEvents,
      performanceMetrics,
    };
  }

  /**
   * Obtiene eventos del sistema con filtros y paginación
   */
  async getSystemEvents(filters?: {
    page?: number;
    limit?: number;
    eventType?: SystemEventType;
    severity?: SystemSeverity;
    component?: string;
    startDate?: Date;
    endDate?: Date;
    correlationId?: string;
  }): Promise<{
    events: SystemEvent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.component) {
      where.component = filters.component;
    }

    if (filters?.correlationId) {
      where.correlationId = filters.correlationId;
    }

    const [events, total] = await this.systemEventRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      events,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Genera reporte de rendimiento del sistema
   */
  async generatePerformanceReport(timeframe: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    summary: {
      totalRequests: number;
      averageResponseTime: number;
      errorRate: number;
      peakMemoryUsage: number;
      totalErrors: number;
    };
    byEndpoint: Array<{
      endpoint: string;
      method: string;
      requestCount: number;
      averageResponseTime: number;
      errorCount: number;
    }>;
    byHour: Array<{
      hour: string;
      requestCount: number;
      averageResponseTime: number;
      errorRate: number;
    }>;
  }> {
    const where: any = {
      createdAt: Between(timeframe.startDate, timeframe.endDate),
      eventType: SystemEventType.API_REQUEST,
    };

    // Resumen general
    const totalRequests = await this.systemEventRepository.count({ where });

    const responseTimeStats = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('AVG(event.executionTimeMs)', 'avg')
      .addSelect('MAX(event.memoryUsageMb)', 'peakMemory')
      .where(where)
      .andWhere('event.executionTimeMs IS NOT NULL')
      .getRawOne();

    const averageResponseTime = responseTimeStats?.avg ? parseFloat(responseTimeStats.avg) : 0;
    const peakMemoryUsage = responseTimeStats?.peakMemory ? parseFloat(responseTimeStats.peakMemory) : 0;

    const totalErrors = await this.systemEventRepository.count({
      where: {
        ...where,
        severity: SystemSeverity.ERROR,
      },
    });

    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    // Por endpoint
    const byEndpoint = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('event.endpoint', 'endpoint')
      .addSelect('event.method', 'method')
      .addSelect('COUNT(*)', 'requestCount')
      .addSelect('AVG(event.executionTimeMs)', 'avgResponseTime')
      .addSelect('SUM(CASE WHEN event.severity = :error THEN 1 ELSE 0 END)', 'errorCount')
      .where(where)
      .setParameters({ error: SystemSeverity.ERROR })
      .groupBy('event.endpoint')
      .addGroupBy('event.method')
      .getRawMany();

    const byEndpointFormatted = byEndpoint.map(item => ({
      endpoint: item.endpoint || 'unknown',
      method: item.method || 'unknown',
      requestCount: parseInt(item.requestCount),
      averageResponseTime: item.avgResponseTime ? parseFloat(item.avgResponseTime) : 0,
      errorCount: parseInt(item.errorCount || '0'),
    }));

    // Por hora
    const byHour = await this.systemEventRepository
      .createQueryBuilder('event')
      .select("DATE_TRUNC('hour', event.createdAt)", 'hour')
      .addSelect('COUNT(*)', 'requestCount')
      .addSelect('AVG(event.executionTimeMs)', 'avgResponseTime')
      .addSelect('(SUM(CASE WHEN event.severity = :error THEN 1 ELSE 0 END) * 100.0 / COUNT(*))', 'errorRate')
      .where(where)
      .setParameters({ error: SystemSeverity.ERROR })
      .groupBy("DATE_TRUNC('hour', event.createdAt)")
      .orderBy("DATE_TRUNC('hour', event.createdAt)", 'ASC')
      .getRawMany();

    const byHourFormatted = byHour.map(item => ({
      hour: item.hour,
      requestCount: parseInt(item.requestCount),
      averageResponseTime: item.avgResponseTime ? parseFloat(item.avgResponseTime) : 0,
      errorRate: item.errorRate ? parseFloat(item.errorRate) : 0,
    }));

    return {
      summary: {
        totalRequests,
        averageResponseTime,
        errorRate,
        peakMemoryUsage,
        totalErrors,
      },
      byEndpoint: byEndpointFormatted,
      byHour: byHourFormatted,
    };
  }

  /**
   * Obtiene métricas de rendimiento
   */
  private async getPerformanceMetrics(where: any): Promise<{
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
  }> {
    // Tiempo promedio de respuesta para API requests
    const responseTimeStats = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('AVG(event.executionTimeMs)', 'avg')
      .where({
        ...where,
        eventType: SystemEventType.API_REQUEST,
      })
      .andWhere('event.executionTimeMs IS NOT NULL')
      .getRawOne();

    const averageResponseTime = responseTimeStats?.avg ? parseFloat(responseTimeStats.avg) : 0;

    // Tasa de error
    const totalApiRequests = await this.systemEventRepository.count({
      where: {
        ...where,
        eventType: SystemEventType.API_REQUEST,
      },
    });

    const apiErrors = await this.systemEventRepository.count({
      where: {
        ...where,
        eventType: SystemEventType.API_REQUEST,
        severity: SystemSeverity.ERROR,
      },
    });

    const errorRate = totalApiRequests > 0 ? (apiErrors / totalApiRequests) * 100 : 0;

    // Throughput (requests por hora)
    const throughput = await this.calculateThroughput(where);

    return {
      averageResponseTime,
      errorRate,
      throughput,
    };
  }

  /**
   * Calcula el throughput (requests por hora)
   */
  private async calculateThroughput(where: any): Promise<number> {
    const totalRequests = await this.systemEventRepository.count({
      where: {
        ...where,
        eventType: SystemEventType.API_REQUEST,
      },
    });

    // Calcular horas en el rango
    const dateRange = where.createdAt;
    let hours = 1; // default

    if (dateRange && dateRange._type === 'between') {
      const start = new Date(dateRange._value[0]);
      const end = new Date(dateRange._value[1]);
      hours = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
    }

    return totalRequests / hours;
  }

  /**
   * Elimina eventos antiguos según política de retención
   */
  async deleteOldEvents(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.systemEventRepository.delete({
      createdAt: LessThanOrEqual(cutoffDate),
    });

    return result.affected || 0;
  }

  /**
   * Obtiene eventos por correlación ID
   */
  async getEventsByCorrelationId(correlationId: string): Promise<SystemEvent[]> {
    return this.systemEventRepository.find({
      where: { correlationId },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Busca eventos por texto en descripción o metadatos
   */
  async searchEvents(searchText: string, filters?: {
    eventType?: SystemEventType;
    severity?: SystemSeverity;
    component?: string;
    limit?: number;
  }): Promise<SystemEvent[]> {
    const query = this.systemEventRepository
      .createQueryBuilder('event')
      .where('event.description ILIKE :searchText', { searchText: `%${searchText}%` })
      .orWhere('event.errorMessage ILIKE :searchText', { searchText: `%${searchText}%` });

    if (filters?.eventType) {
      query.andWhere('event.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters?.severity) {
      query.andWhere('event.severity = :severity', { severity: filters.severity });
    }

    if (filters?.component) {
      query.andWhere('event.component = :component', { component: filters.component });
    }

    query.orderBy('event.createdAt', 'DESC');

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }
}