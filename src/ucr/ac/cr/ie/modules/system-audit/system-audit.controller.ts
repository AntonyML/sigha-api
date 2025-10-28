import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemAuditService, SystemMetrics, PerformanceMetrics } from './system-audit.service';
import { SystemEvent, SystemEventType, SystemSeverity } from '../../domain/system-audit/system-event.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('System Audit')
@ApiBearerAuth()
@Controller('system-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemAuditController {
  private readonly logger = new Logger(SystemAuditController.name);

  constructor(private readonly systemAuditService: SystemAuditService) {}

  @Get('metrics')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get current system metrics' })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
    type: Object,
  })
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      return this.systemAuditService.getSystemMetrics();
    } catch (error) {
      this.logger.error('Failed to get system metrics', error);
      throw new HttpException(
        'Failed to retrieve system metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Perform system health check' })
  @ApiResponse({
    status: 200,
    description: 'Health check completed successfully',
    type: Object,
  })
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics;
    issues: string[];
    recommendations: string[];
    lastHealthCheck: Date;
  }> {
    try {
      return await this.systemAuditService.performHealthCheck();
    } catch (error) {
      this.logger.error('Failed to perform health check', error);
      throw new HttpException(
        'Failed to perform health check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('events')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get system events with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'System events retrieved successfully',
    type: Object,
  })
  async getSystemEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('eventType') eventType?: SystemEventType,
    @Query('severity') severity?: SystemSeverity,
    @Query('component') component?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('correlationId') correlationId?: string,
  ): Promise<{
    events: SystemEvent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const filters = {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        eventType,
        severity,
        component,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        correlationId,
      };

      return await this.systemAuditService.getSystemEvents(filters);
    } catch (error) {
      this.logger.error('Failed to get system events', error);
      throw new HttpException(
        'Failed to retrieve system events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({
    status: 200,
    description: 'System statistics retrieved successfully',
    type: Object,
  })
  async getSystemStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: SystemEventType,
    @Query('severity') severity?: SystemSeverity,
    @Query('component') component?: string,
  ): Promise<{
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
    try {
      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        eventType,
        severity,
        component,
      };

      return await this.systemAuditService.getSystemStatistics(filters);
    } catch (error) {
      this.logger.error('Failed to get system statistics', error);
      throw new HttpException(
        'Failed to retrieve system statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('performance-report')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Generate performance report' })
  @ApiResponse({
    status: 200,
    description: 'Performance report generated successfully',
    type: Object,
  })
  async generatePerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{
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
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'startDate and endDate are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const timeframe = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };

      return await this.systemAuditService.generatePerformanceReport(timeframe);
    } catch (error) {
      this.logger.error('Failed to generate performance report', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate performance report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('events')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Log a system event manually' })
  @ApiResponse({
    status: 201,
    description: 'System event logged successfully',
    type: SystemEvent,
  })
  async logSystemEvent(
    @Body() eventData: {
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
    },
  ): Promise<SystemEvent> {
    try {
      return await this.systemAuditService.logSystemEvent(eventData);
    } catch (error) {
      this.logger.error('Failed to log system event', error);
      throw new HttpException(
        'Failed to log system event',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('performance-metrics')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Log performance metrics' })
  @ApiResponse({
    status: 201,
    description: 'Performance metrics logged successfully',
    type: SystemEvent,
  })
  async logPerformanceMetrics(
    @Body() data: {
      operation: string;
      metrics: PerformanceMetrics;
      metadata?: any;
    },
  ): Promise<SystemEvent> {
    try {
      return await this.systemAuditService.logPerformanceMetrics(
        data.operation,
        data.metrics,
        data.metadata,
      );
    } catch (error) {
      this.logger.error('Failed to log performance metrics', error);
      throw new HttpException(
        'Failed to log performance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('correlation/:correlationId')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get events by correlation ID' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [SystemEvent],
  })
  async getEventsByCorrelationId(
    @Param('correlationId') correlationId: string,
  ): Promise<SystemEvent[]> {
    try {
      // Access repository through service
      const systemAuditRepository = (this.systemAuditService as any).systemAuditRepository;
      return await systemAuditRepository.getEventsByCorrelationId(correlationId);
    } catch (error) {
      this.logger.error('Failed to get events by correlation ID', error);
      throw new HttpException(
        'Failed to retrieve events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Search system events' })
  @ApiResponse({
    status: 200,
    description: 'Search completed successfully',
    type: [SystemEvent],
  })
  async searchEvents(
    @Query('q') searchText: string,
    @Query('eventType') eventType?: SystemEventType,
    @Query('severity') severity?: SystemSeverity,
    @Query('component') component?: string,
    @Query('limit') limit?: string,
  ): Promise<SystemEvent[]> {
    try {
      if (!searchText) {
        throw new HttpException(
          'Search query (q) is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const filters = {
        eventType,
        severity,
        component,
        limit: limit ? parseInt(limit) : undefined,
      };

      // Access repository through service
      const systemAuditRepository = (this.systemAuditService as any).systemAuditRepository;
      return await systemAuditRepository.searchEvents(searchText, filters);
    } catch (error) {
      this.logger.error('Failed to search events', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to search events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}