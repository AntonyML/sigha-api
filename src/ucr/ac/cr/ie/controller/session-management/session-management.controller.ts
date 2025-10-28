import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '../../domain/auth/core/role.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionManagementService } from '../../services/session-management/session-management.service';
import { UserSession, SessionStatus, SessionType } from '../../domain/session-management/user-session.entity';

class CreateSessionDto {
  userId: number;
  sessionToken: string;
  refreshToken?: string;
  sessionType?: SessionType;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  locationInfo?: any;
  expiresAt: Date;
  isSecure?: boolean;
  twoFactorVerified?: boolean;
  metadata?: any;
}

class RefreshSessionDto {
  refreshToken: string;
  newSessionToken: string;
  newExpiresAt: Date;
}

class UpdateSessionInfoDto {
  deviceInfo?: any;
  locationInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

class SessionFiltersDto {
  status?: SessionStatus;
  sessionType?: SessionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@ApiTags('Session Management')
@Controller('session-management')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SessionManagementController {
  constructor(private readonly sessionService: SessionManagementService) {}

  @Post('sessions')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user session' })
  @ApiResponse({ status: 201, description: 'Session created successfully', type: UserSession })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createSession(@Body(ValidationPipe) createSessionDto: CreateSessionDto): Promise<UserSession> {
    return this.sessionService.createSession(createSessionDto);
  }

  @Post('validate/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate and update session activity' })
  @ApiResponse({ status: 200, description: 'Session is valid', type: UserSession })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session invalid or expired' })
  async validateSession(@Param('token') sessionToken: string): Promise<UserSession> {
    return this.sessionService.validateAndUpdateSession(sessionToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh session using refresh token' })
  @ApiResponse({ status: 200, description: 'Session refreshed successfully', type: UserSession })
  @ApiResponse({ status: 404, description: 'Refresh token not found' })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  async refreshSession(@Body(ValidationPipe) refreshDto: RefreshSessionDto): Promise<UserSession> {
    return this.sessionService.refreshSession(refreshDto.refreshToken, {
      sessionToken: refreshDto.newSessionToken,
      expiresAt: refreshDto.newExpiresAt,
    });
  }

  @Delete('sessions/:id')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invalidate a specific session' })
  @ApiResponse({ status: 204, description: 'Session invalidated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async invalidateSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Query('reason') reason?: string,
  ): Promise<void> {
    return this.sessionService.invalidateSession(sessionId, reason);
  }

  @Delete('users/:userId/sessions')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate all sessions for a user' })
  @ApiResponse({ status: 200, description: 'Sessions invalidated successfully' })
  async invalidateAllUserSessions(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('reason') reason?: string,
  ): Promise<{ invalidatedCount: number }> {
    const invalidatedCount = await this.sessionService.invalidateAllUserSessions(userId, reason);
    return { invalidatedCount };
  }

  @Get('users/:userId/sessions/active')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get active sessions for a user' })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved successfully', type: [UserSession] })
  async getActiveUserSessions(@Param('userId', ParseIntPipe) userId: number): Promise<UserSession[]> {
    return this.sessionService.getActiveUserSessions(userId);
  }

  @Get('users/:userId/sessions')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all sessions for a user with optional filters' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully', type: [UserSession] })
  @ApiQuery({ name: 'status', enum: SessionStatus, required: false })
  @ApiQuery({ name: 'sessionType', enum: SessionType, required: false })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getUserSessions(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() filters: SessionFiltersDto,
  ): Promise<UserSession[]> {
    return this.sessionService.getUserSessions(userId, filters);
  }

  @Get('statistics')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', type: Date, required: false })
  @ApiQuery({ name: 'endDate', type: Date, required: false })
  @ApiQuery({ name: 'userId', type: Number, required: false })
  async getSessionStatistics(@Query() filters: { startDate?: Date; endDate?: Date; userId?: number }) {
    return this.sessionService.getSessionStatistics(filters);
  }

  @Put('sessions/:id/extend')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Extend session expiration' })
  @ApiResponse({ status: 200, description: 'Session extended successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async extendSession(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body('additionalMinutes', ParseIntPipe) additionalMinutes: number,
  ): Promise<{ message: string }> {
    if (additionalMinutes <= 0 || additionalMinutes > 1440) { // Max 24 hours
      throw new BadRequestException('Additional minutes must be between 1 and 1440');
    }

    await this.sessionService.extendSession(sessionId, additionalMinutes);
    return { message: `Session extended by ${additionalMinutes} minutes` };
  }

  @Post('cleanup/expired')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up expired sessions' })
  @ApiResponse({ status: 200, description: 'Expired sessions cleaned up successfully' })
  async cleanupExpiredSessions(): Promise<{ cleanedCount: number }> {
    const cleanedCount = await this.sessionService.cleanupExpiredSessions();
    return { cleanedCount };
  }

  @Post('cleanup/old')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up old sessions based on retention policy' })
  @ApiResponse({ status: 200, description: 'Old sessions cleaned up successfully' })
  async cleanupOldSessions(
    @Body('retentionDays', ParseIntPipe) retentionDays: number,
  ): Promise<{ cleanedCount: number }> {
    if (retentionDays < 1 || retentionDays > 365) {
      throw new BadRequestException('Retention days must be between 1 and 365');
    }

    const cleanedCount = await this.sessionService.cleanupOldSessions(retentionDays);
    return { cleanedCount };
  }

  @Post('suspicious/check')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check and handle suspicious sessions' })
  @ApiResponse({ status: 200, description: 'Suspicious sessions checked and handled' })
  async handleSuspiciousSessions(
    @Body('timeframeHours', ParseIntPipe) timeframeHours: number = 24,
  ): Promise<{
    suspiciousSessions: UserSession[];
    actionsTaken: string[];
  }> {
    if (timeframeHours < 1 || timeframeHours > 168) { // Max 1 week
      throw new BadRequestException('Timeframe hours must be between 1 and 168');
    }

    return this.sessionService.handleSuspiciousSessions(timeframeHours);
  }

  @Put('sessions/:id/info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update session information (device, location, etc.)' })
  @ApiResponse({ status: 200, description: 'Session info updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async updateSessionInfo(
    @Param('id', ParseIntPipe) sessionId: number,
    @Body(ValidationPipe) updateDto: UpdateSessionInfoDto,
  ): Promise<{ message: string }> {
    await this.sessionService.updateSessionInfo(sessionId, updateDto);
    return { message: 'Session information updated successfully' };
  }

  @Post('sessions/:id/verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark session as 2FA verified' })
  @ApiResponse({ status: 200, description: 'Session marked as 2FA verified' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async verifyTwoFactor(@Param('id', ParseIntPipe) sessionId: number): Promise<{ message: string }> {
    await this.sessionService.verifyTwoFactor(sessionId);
    return { message: 'Session marked as 2FA verified' };
  }

  @Post('force-logout/inactive')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force logout of inactive sessions' })
  @ApiResponse({ status: 200, description: 'Inactive sessions logged out successfully' })
  async forceLogoutInactiveSessions(
    @Body('inactivityMinutes', ParseIntPipe) inactivityMinutes: number,
  ): Promise<{ loggedOutCount: number }> {
    if (inactivityMinutes < 1 || inactivityMinutes > 10080) { // Max 1 week
      throw new BadRequestException('Inactivity minutes must be between 1 and 10080');
    }

    const loggedOutCount = await this.sessionService.forceLogoutInactiveSessions(inactivityMinutes);
    return { loggedOutCount };
  }

  @Get('dashboard/summary')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get session dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved successfully' })
  async getSessionDashboardSummary(): Promise<{
    totalActiveSessions: number;
    totalSessionsToday: number;
    totalSessionsThisWeek: number;
    sessionsByType: Record<string, number>;
    recentActivity: Array<{
      userId: number;
      sessionCount: number;
      lastActivity: Date;
    }>;
  }> {
    return this.sessionService.getSessionDashboardSummary();
  }
}