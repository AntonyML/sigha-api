import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import * as os from 'os';
import * as process from 'process';
import { SystemEvent, SystemEventType, SystemSeverity } from '../../domain/system-audit/system-event.entity';
import { SystemAuditRepository } from '../../repository/system-audit/system-audit.repository';

export interface SystemMetrics {
  memoryUsage: number;
  cpuUsage: number;
  uptime: number;
  loadAverage: number[];
  totalMemory: number;
  freeMemory: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryDelta: number;
  cpuTime: number;
  timestamp: Date;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

@Injectable()
export class SystemAuditService implements OnModuleInit {
  private readonly logger = new Logger(SystemAuditService.name);
  private startTime: number;
  private lastMemoryUsage: NodeJS.MemoryUsage;
  private metricsHistory: SystemMetrics[] = [];
  private readonly MAX_HISTORY_SIZE = 100;

  constructor(
    @InjectRepository(SystemEvent)
    private readonly systemEventRepository: Repository<SystemEvent>,
    private readonly systemAuditRepository: SystemAuditRepository,
  ) {}

  async onModuleInit() {
    this.startTime = Date.now();
    this.lastMemoryUsage = process.memoryUsage();

    // Registrar inicio de aplicación
    await this.logSystemEvent({
      eventType: SystemEventType.APPLICATION_START,
      severity: SystemSeverity.INFO,
      component: 'SystemAuditService',
      description: 'Application started successfully',
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
        startupTime: new Date().toISOString(),
      },
    });

    // Iniciar monitoreo periódico
    this.startPeriodicMonitoring();

    this.logger.log('SystemAuditService initialized and monitoring started');
  }

  /**
   * Registra un evento del sistema
   */
  async logSystemEvent(eventData: {
    eventType: SystemEventType;
    severity?: SystemSeverity;
    component?: string;
    method?: string;
    endpoint?: string;
    description?: string;
    errorMessage?: string;
    errorStack?: string;
    executionTimeMs?: number;
    memoryUsageMb?: number;
    cpuUsagePercent?: number;
    requestSizeBytes?: number;
    responseSizeBytes?: number;
    httpStatusCode?: number;
    userId?: number;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
    correlationId?: string;
  }): Promise<SystemEvent> {
    try {
      const event = this.systemEventRepository.create({
        eventType: eventData.eventType,
        severity: eventData.severity || SystemSeverity.INFO,
        component: eventData.component,
        method: eventData.method,
        endpoint: eventData.endpoint,
        description: eventData.description,
        errorMessage: eventData.errorMessage,
        errorStack: eventData.errorStack,
        executionTimeMs: eventData.executionTimeMs,
        memoryUsageMb: eventData.memoryUsageMb,
        cpuUsagePercent: eventData.cpuUsagePercent,
        requestSizeBytes: eventData.requestSizeBytes,
        responseSizeBytes: eventData.responseSizeBytes,
        httpStatusCode: eventData.httpStatusCode,
        userId: eventData.userId,
        ipAddress: eventData.ipAddress,
        userAgent: eventData.userAgent,
        metadata: eventData.metadata,
        correlationId: eventData.correlationId,
      });

      const savedEvent = await this.systemEventRepository.save(event);

      // Log crítico para errores
      if (eventData.severity === SystemSeverity.CRITICAL ||
          eventData.severity === SystemSeverity.ERROR) {
        this.logger.error(`System Event: ${eventData.eventType} - ${eventData.description}`, {
          eventId: savedEvent.id,
          errorMessage: eventData.errorMessage,
          stack: eventData.errorStack,
        });
      } else if (eventData.severity === SystemSeverity.WARNING) {
        this.logger.warn(`System Event: ${eventData.eventType} - ${eventData.description}`, {
          eventId: savedEvent.id,
        });
      }

      return savedEvent;
    } catch (error) {
      this.logger.error('Failed to log system event', error);
      throw error;
    }
  }

  /**
   * Registra métricas de rendimiento de una operación
   */
  async logPerformanceMetrics(
    operation: string,
    metrics: PerformanceMetrics,
    metadata?: any,
  ): Promise<SystemEvent> {
    const severity = this.determinePerformanceSeverity(metrics);

    return this.logSystemEvent({
      eventType: SystemEventType.PERFORMANCE_WARNING,
      severity,
      component: 'PerformanceMonitor',
      method: operation,
      description: `Performance metrics for ${operation}`,
      executionTimeMs: metrics.executionTime,
      memoryUsageMb: metrics.memoryDelta,
      metadata: {
        ...metadata,
        performanceMetrics: metrics,
      },
    });
  }

  /**
   * Registra un error del sistema
   */
  async logSystemError(
    error: Error,
    context?: {
      component?: string;
      method?: string;
      userId?: number;
      correlationId?: string;
      metadata?: any;
    },
  ): Promise<SystemEvent> {
    return this.logSystemEvent({
      eventType: SystemEventType.ERROR_OCCURRED,
      severity: SystemSeverity.ERROR,
      component: context?.component || 'Unknown',
      method: context?.method,
      description: `System error: ${error.message}`,
      errorMessage: error.message,
      errorStack: error.stack,
      userId: context?.userId,
      correlationId: context?.correlationId,
      metadata: context?.metadata,
    });
  }

  /**
   * Registra una solicitud API
   */
  async logApiRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    executionTime: number,
    metadata?: {
      userId?: number;
      ipAddress?: string;
      userAgent?: string;
      requestSize?: number;
      responseSize?: number;
      correlationId?: string;
    },
  ): Promise<SystemEvent> {
    const severity = statusCode >= 500 ? SystemSeverity.ERROR :
                    statusCode >= 400 ? SystemSeverity.WARNING :
                    SystemSeverity.INFO;

    return this.logSystemEvent({
      eventType: SystemEventType.API_REQUEST,
      severity,
      component: 'API',
      method,
      endpoint,
      description: `API request: ${method} ${endpoint}`,
      executionTimeMs: executionTime,
      httpStatusCode: statusCode,
      userId: metadata?.userId,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      requestSizeBytes: metadata?.requestSize,
      responseSizeBytes: metadata?.responseSize,
      correlationId: metadata?.correlationId,
    });
  }

  /**
   * Obtiene métricas actuales del sistema
   */
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    const metrics: SystemMetrics = {
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
      cpuUsage: process.cpuUsage().user / 1000000, // seconds
      uptime: process.uptime(),
      loadAverage: os.loadavg(),
      totalMemory: totalMemory / 1024 / 1024, // MB
      freeMemory: freeMemory / 1024 / 1024, // MB
      heapUsed: memUsage.heapUsed / 1024 / 1024,
      heapTotal: memUsage.heapTotal / 1024 / 1024,
      external: memUsage.external / 1024 / 1024,
      rss: memUsage.rss / 1024 / 1024,
    };

    // Mantener historial de métricas
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.MAX_HISTORY_SIZE) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  /**
   * Obtiene estadísticas de eventos del sistema
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
    return this.systemAuditRepository.getSystemStatistics(filters);
  }

  /**
   * Obtiene eventos del sistema con filtros
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
    return this.systemAuditRepository.getSystemEvents(filters);
  }

  /**
   * Verifica el estado de salud del sistema
   */
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics;
    issues: string[];
    recommendations: string[];
    lastHealthCheck: Date;
  }> {
    const metrics = this.getSystemMetrics();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Verificar uso de memoria
    const memoryUsagePercent = (metrics.heapUsed / metrics.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      issues.push('Critical memory usage');
      recommendations.push('Consider increasing memory allocation or optimizing memory usage');
    } else if (memoryUsagePercent > 75) {
      issues.push('High memory usage');
      recommendations.push('Monitor memory usage closely');
    }

    // Verificar load average
    if (metrics.loadAverage[0] > os.cpus().length * 2) {
      issues.push('High CPU load');
      recommendations.push('Check for CPU-intensive processes');
    }

    // Verificar uptime (reinicio reciente)
    if (metrics.uptime < 300) { // 5 minutos
      issues.push('Recent system restart');
      recommendations.push('Investigate cause of recent restart');
    }

    // Verificar errores recientes
    const recentErrors = await this.systemEventRepository.count({
      where: {
        severity: SystemSeverity.ERROR,
        createdAt: new Date(Date.now() - 3600000), // Última hora
      },
    });

    if (recentErrors > 10) {
      issues.push('High error rate in the last hour');
      recommendations.push('Check application logs for recurring errors');
    }

    const status = issues.length > 2 ? 'critical' :
                   issues.length > 0 ? 'warning' : 'healthy';

    return {
      status,
      metrics,
      issues,
      recommendations,
      lastHealthCheck: new Date(),
    };
  }

  /**
   * Obtiene historial de métricas del sistema
   */
  getMetricsHistory(hours: number = 1): SystemMetrics[] {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.metricsHistory.filter(metrics =>
      // Asumiendo que las métricas tienen timestamp, si no, filtrar por índice
      true // Por ahora devolver todas
    );
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
    return this.systemAuditRepository.generatePerformanceReport(timeframe);
  }

  /**
   * Inicia monitoreo periódico del sistema
   */
  private startPeriodicMonitoring(): void {
    // Monitoreo cada 5 minutos
    setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck();

        if (healthCheck.status === 'critical') {
          await this.logSystemEvent({
            eventType: SystemEventType.PERFORMANCE_WARNING,
            severity: SystemSeverity.CRITICAL,
            component: 'SystemMonitor',
            description: 'Critical system health issues detected',
            metadata: healthCheck,
          });
        } else if (healthCheck.status === 'warning') {
          await this.logSystemEvent({
            eventType: SystemEventType.PERFORMANCE_WARNING,
            severity: SystemSeverity.WARNING,
            component: 'SystemMonitor',
            description: 'System health warnings detected',
            metadata: healthCheck,
          });
        }

        // Registrar métricas cada hora
        const now = new Date();
        if (now.getMinutes() === 0) {
          await this.logSystemEvent({
            eventType: SystemEventType.OTHER,
            severity: SystemSeverity.INFO,
            component: 'SystemMonitor',
            description: 'Periodic system metrics',
            metadata: healthCheck.metrics,
          });
        }
      } catch (error) {
        this.logger.error('Failed to perform periodic health check', error);
      }
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  /**
   * Determina la severidad basada en métricas de rendimiento
   */
  private determinePerformanceSeverity(metrics: PerformanceMetrics): SystemSeverity {
    if (metrics.executionTime > 5000 || metrics.memoryDelta > 100) {
      return SystemSeverity.CRITICAL;
    } else if (metrics.executionTime > 2000 || metrics.memoryDelta > 50) {
      return SystemSeverity.WARNING;
    }
    return SystemSeverity.INFO;
  }
  async getPerformanceMetricsByComponent(
    component: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    component: string;
    averageExecutionTime: number;
    maxExecutionTime: number;
    minExecutionTime: number;
    totalRequests: number;
    errorCount: number;
    p95ExecutionTime: number;
  }> {
    const where: any = {
      component,
    };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    // Obtener estadísticas básicas
    const stats = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('COUNT(*)', 'totalRequests')
      .addSelect('AVG(event.executionTimeMs)', 'avgExecutionTime')
      .addSelect('MAX(event.executionTimeMs)', 'maxExecutionTime')
      .addSelect('MIN(event.executionTimeMs)', 'minExecutionTime')
      .addSelect('SUM(CASE WHEN event.severity = :error THEN 1 ELSE 0 END)', 'errorCount')
      .where(where)
      .andWhere('event.executionTimeMs IS NOT NULL')
      .setParameters({ error: SystemSeverity.ERROR })
      .getRawOne();

    // Calcular percentil 95
    const p95Result = await this.systemEventRepository
      .createQueryBuilder('event')
      .select('event.executionTimeMs', 'executionTime')
      .where(where)
      .andWhere('event.executionTimeMs IS NOT NULL')
      .orderBy('event.executionTimeMs', 'ASC')
      .getRawMany();

    let p95ExecutionTime = 0;
    if (p95Result.length > 0) {
      const index = Math.floor(p95Result.length * 0.95);
      p95ExecutionTime = parseFloat(p95Result[index]?.executionTime || '0');
    }

    return {
      component,
      averageExecutionTime: stats?.avgExecutionTime ? parseFloat(stats.avgExecutionTime) : 0,
      maxExecutionTime: stats?.maxExecutionTime ? parseFloat(stats.maxExecutionTime) : 0,
      minExecutionTime: stats?.minExecutionTime ? parseFloat(stats.minExecutionTime) : 0,
      totalRequests: parseInt(stats?.totalRequests || '0'),
      errorCount: parseInt(stats?.errorCount || '0'),
      p95ExecutionTime,
    };
  }
}