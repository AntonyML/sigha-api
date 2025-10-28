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
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog, ActivityType, ActivitySeverity } from '../../domain/activity-logs/activity-log.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../../domain/auth/core/role.entity';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  private readonly logger = new Logger(ActivityLogsController.name);

  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get activity logs with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
    type: Object,
  })
  async getActivityLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('severity') severity?: ActivitySeverity,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('sessionId') sessionId?: string,
    @Query('correlationId') correlationId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('success') success?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
  ): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const filters = {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        userId: userId ? parseInt(userId) : undefined,
        activityType,
        severity,
        entityType,
        entityId: entityId ? parseInt(entityId) : undefined,
        sessionId,
        correlationId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        success: success ? success === 'true' : undefined,
        tags: tags ? tags.split(',') : undefined,
        search,
      };

      return await this.activityLogsService.getActivityLogs(filters);
    } catch (error) {
      this.logger.error('Failed to get activity logs', error);
      throw new HttpException(
        'Failed to retrieve activity logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('statistics')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get activity statistics' })
  @ApiResponse({
    status: 200,
    description: 'Activity statistics retrieved successfully',
    type: Object,
  })
  async getActivityStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ): Promise<{
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
    try {
      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        userId: userId ? parseInt(userId) : undefined,
      };

      return await this.activityLogsService.getActivityStatistics(filters);
    } catch (error) {
      this.logger.error('Failed to get activity statistics', error);
      throw new HttpException(
        'Failed to retrieve activity statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get activity logs for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'User activity logs retrieved successfully',
    type: Object,
  })
  async getUserActivityLogs(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
      }

      const filters = {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        activityType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      return await this.activityLogsService.getUserActivityLogs(userIdNum, filters);
    } catch (error) {
      this.logger.error('Failed to get user activity logs', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve user activity logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('session/:sessionId')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get activity logs for a specific session' })
  @ApiResponse({
    status: 200,
    description: 'Session activity logs retrieved successfully',
    type: Object,
  })
  async getSessionActivityLogs(
    @Param('sessionId') sessionId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    logs: ActivityLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const filters = {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      };

      return await this.activityLogsService.getSessionActivityLogs(sessionId, filters);
    } catch (error) {
      this.logger.error('Failed to get session activity logs', error);
      throw new HttpException(
        'Failed to retrieve session activity logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('correlation/:correlationId')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get activity logs by correlation ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
    type: [ActivityLog],
  })
  async getActivityLogsByCorrelationId(
    @Param('correlationId') correlationId: string,
  ): Promise<ActivityLog[]> {
    try {
      return await this.activityLogsService.getActivityLogsByCorrelationId(correlationId);
    } catch (error) {
      this.logger.error('Failed to get activity logs by correlation ID', error);
      throw new HttpException(
        'Failed to retrieve activity logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Search activity logs' })
  @ApiResponse({
    status: 200,
    description: 'Search completed successfully',
    type: [ActivityLog],
  })
  async searchActivityLogs(
    @Query('q') searchText: string,
    @Query('userId') userId?: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('limit') limit?: string,
  ): Promise<ActivityLog[]> {
    try {
      if (!searchText) {
        throw new HttpException(
          'Search query (q) is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const filters = {
        userId: userId ? parseInt(userId) : undefined,
        activityType,
        limit: limit ? parseInt(limit) : undefined,
      };

      return await this.activityLogsService.searchActivityLogs(searchText, filters);
    } catch (error) {
      this.logger.error('Failed to search activity logs', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to search activity logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('summary-by-date')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get activity summary by date range' })
  @ApiResponse({
    status: 200,
    description: 'Activity summary retrieved successfully',
    type: Object,
  })
  async getActivitySummaryByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<Array<{
    date: string;
    totalActivities: number;
    successfulActivities: number;
    failedActivities: number;
    activitiesByType: Record<string, number>;
  }>> {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'startDate and endDate are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.activityLogsService.getActivitySummaryByDate(
        new Date(startDate),
        new Date(endDate),
      );
    } catch (error) {
      this.logger.error('Failed to get activity summary by date', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve activity summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('log-activity')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Log a new activity manually' })
  @ApiResponse({
    status: 201,
    description: 'Activity logged successfully',
    type: ActivityLog,
  })
  async logActivity(
    @Body() activityData: {
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
    },
  ): Promise<ActivityLog> {
    try {
      return await this.activityLogsService.logActivity(activityData);
    } catch (error) {
      this.logger.error('Failed to log activity', error);
      throw new HttpException(
        'Failed to log activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId/recent')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get recent activities for a user' })
  @ApiResponse({
    status: 200,
    description: 'Recent user activities retrieved successfully',
    type: [ActivityLog],
  })
  async getRecentUserActivities(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ): Promise<ActivityLog[]> {
    try {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
      }

      const limitNum = limit ? parseInt(limit) : 10;
      return await this.activityLogsService.getRecentUserActivities(userIdNum, limitNum);
    } catch (error) {
      this.logger.error('Failed to get recent user activities', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to retrieve recent user activities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId/suspicious-activity')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Check for suspicious activity of a user' })
  @ApiResponse({
    status: 200,
    description: 'Suspicious activity check completed successfully',
    type: Object,
  })
  async checkSuspiciousActivity(
    @Param('userId') userId: string,
    @Query('timeframeHours') timeframeHours?: string,
  ): Promise<{
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    indicators: string[];
    recentFailedActivities: number;
    unusualPatterns: string[];
  }> {
    try {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        throw new HttpException('Invalid user ID', HttpStatus.BAD_REQUEST);
      }

      const timeframe = timeframeHours ? parseInt(timeframeHours) : 24;
      return await this.activityLogsService.checkSuspiciousActivity(userIdNum, timeframe);
    } catch (error) {
      this.logger.error('Failed to check suspicious activity', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to check suspicious activity',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}