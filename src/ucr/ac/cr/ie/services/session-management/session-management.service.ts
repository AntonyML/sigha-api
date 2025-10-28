import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession, SessionStatus, SessionType } from '../../domain/session-management/user-session.entity';
import { SessionManagementRepository } from '../../repository/session-management/session-management.repository';

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  constructor(
    private readonly sessionRepository: SessionManagementRepository,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Crea una nueva sesión para un usuario
   */
  async createSession(sessionData: {
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
  }): Promise<UserSession> {
    try {
      this.logger.log(`Creating new session for user ${sessionData.userId}`);

      // Verificar límites de sesiones concurrentes
      await this.checkConcurrentSessionLimit(sessionData.userId);

      const session = await this.sessionRepository.createSession(sessionData);

      this.logger.log(`Session created successfully with ID: ${session.id}`);
      return session;
    } catch (error) {
      this.logger.error(`Failed to create session for user ${sessionData.userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Valida y actualiza una sesión existente
   */
  async validateAndUpdateSession(sessionToken: string): Promise<UserSession> {
    try {
      const session = await this.sessionRepository.findBySessionToken(sessionToken);

      if (!session) {
        throw new NotFoundException('Session not found or invalid');
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new BadRequestException(`Session is ${session.status.toLowerCase()}`);
      }

      if (session.expiresAt < new Date()) {
        await this.sessionRepository.invalidateSession(session.id, 'Session expired');
        throw new BadRequestException('Session has expired');
      }

      // Actualizar última actividad
      await this.sessionRepository.updateLastActivity(session.id);

      return session;
    } catch (error) {
      this.logger.error(`Failed to validate session with token: ${sessionToken}`, error.stack);
      throw error;
    }
  }

  /**
   * Refresca un token usando refresh token
   */
  async refreshSession(refreshToken: string, newSessionData: {
    sessionToken: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    try {
      const session = await this.sessionRepository.findByRefreshToken(refreshToken);

      if (!session) {
        throw new NotFoundException('Refresh token not found or invalid');
      }

      if (session.status !== SessionStatus.ACTIVE) {
        throw new BadRequestException(`Session is ${session.status.toLowerCase()}`);
      }

      // Actualizar sesión con nuevo token
      await this.userSessionRepository.update(session.id, {
        sessionToken: newSessionData.sessionToken,
        expiresAt: newSessionData.expiresAt,
        lastActivityAt: new Date(),
      });

      const updatedSession = await this.userSessionRepository.findOne({
        where: { id: session.id },
      });

      if (!updatedSession) {
        throw new NotFoundException('Failed to retrieve updated session');
      }

      this.logger.log(`Session refreshed for user ${session.userId}`);
      return updatedSession;
    } catch (error) {
      this.logger.error(`Failed to refresh session with refresh token`, error.stack);
      throw error;
    }
  }

  /**
   * Invalida una sesión específica
   */
  async invalidateSession(sessionId: number, reason?: string): Promise<void> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      await this.sessionRepository.invalidateSession(sessionId, reason);

      this.logger.log(`Session ${sessionId} invalidated for user ${session.userId}. Reason: ${reason || 'No reason provided'}`);
    } catch (error) {
      this.logger.error(`Failed to invalidate session ${sessionId}`, error.stack);
      throw error;
    }
  }

  /**
   * Invalida todas las sesiones de un usuario
   */
  async invalidateAllUserSessions(userId: number, reason?: string): Promise<number> {
    try {
      const invalidatedCount = await this.sessionRepository.invalidateAllUserSessions(userId, reason);

      this.logger.log(`Invalidated ${invalidatedCount} sessions for user ${userId}. Reason: ${reason || 'No reason provided'}`);

      return invalidatedCount;
    } catch (error) {
      this.logger.error(`Failed to invalidate all sessions for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene sesiones activas de un usuario
   */
  async getActiveUserSessions(userId: number): Promise<UserSession[]> {
    try {
      return await this.sessionRepository.getActiveUserSessions(userId);
    } catch (error) {
      this.logger.error(`Failed to get active sessions for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene todas las sesiones de un usuario con filtros
   */
  async getUserSessions(
    userId: number,
    filters?: {
      status?: SessionStatus;
      sessionType?: SessionType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<UserSession[]> {
    try {
      return await this.sessionRepository.getUserSessions(userId, filters);
    } catch (error) {
      this.logger.error(`Failed to get sessions for user ${userId}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de sesiones
   */
  async getSessionStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: number;
  }): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    revokedSessions: number;
    sessionsByType: Record<string, number>;
    sessionsByStatus: Record<string, number>;
    averageSessionDuration: number;
    topUsersBySessions: Array<{
      userId: number;
      sessionCount: number;
    }>;
  }> {
    try {
      return await this.sessionRepository.getSessionStatistics(filters);
    } catch (error) {
      this.logger.error('Failed to get session statistics', error.stack);
      throw error;
    }
  }

  /**
   * Extiende la expiración de una sesión
   */
  async extendSession(sessionId: number, additionalMinutes: number): Promise<void> {
    try {
      const session = await this.userSessionRepository.findOne({
        where: { id: sessionId },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      const newExpiry = new Date(session.expiresAt);
      newExpiry.setMinutes(newExpiry.getMinutes() + additionalMinutes);

      await this.sessionRepository.extendSession(sessionId, newExpiry);

      this.logger.log(`Session ${sessionId} extended by ${additionalMinutes} minutes`);
    } catch (error) {
      this.logger.error(`Failed to extend session ${sessionId}`, error.stack);
      throw error;
    }
  }

  /**
   * Limpia sesiones expiradas automáticamente
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const cleanedCount = await this.sessionRepository.invalidateExpiredSessions();

      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
      }

      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup expired sessions', error.stack);
      throw error;
    }
  }

  /**
   * Detecta y maneja sesiones sospechosas
   */
  async handleSuspiciousSessions(timeframeHours: number = 24): Promise<{
    suspiciousSessions: UserSession[];
    actionsTaken: string[];
  }> {
    try {
      const suspiciousSessions = await this.sessionRepository.getSuspiciousSessions(timeframeHours);
      const actionsTaken: string[] = [];

      // Lógica básica de detección de anomalías
      const userSessions = new Map<number, UserSession[]>();

      // Agrupar sesiones por usuario
      suspiciousSessions.forEach(session => {
        if (!userSessions.has(session.userId)) {
          userSessions.set(session.userId, []);
        }
        userSessions.get(session.userId)!.push(session);
      });

      // Detectar múltiples sesiones desde diferentes IPs en poco tiempo
      for (const [userId, sessions] of userSessions) {
        const uniqueIPs = new Set(sessions.map(s => s.ipAddress).filter(Boolean));
        const uniqueLocations = new Set(sessions.map(s => JSON.stringify(s.locationInfo)).filter(Boolean));

        if (uniqueIPs.size > 3 || uniqueLocations.size > 2) {
          // Marcar como sospechoso y notificar
          actionsTaken.push(`User ${userId} has suspicious activity: ${sessions.length} sessions from ${uniqueIPs.size} different IPs`);

          // Opcional: invalidar sesiones más antiguas
          const sessionsToInvalidate = sessions.slice(2); // Mantener solo las 2 más recientes
          for (const session of sessionsToInvalidate) {
            await this.invalidateSession(session.id, 'Suspicious activity detected');
            actionsTaken.push(`Invalidated session ${session.id} for user ${userId}`);
          }
        }
      }

      return {
        suspiciousSessions,
        actionsTaken,
      };
    } catch (error) {
      this.logger.error('Failed to handle suspicious sessions', error.stack);
      throw error;
    }
  }

  /**
   * Actualiza información de sesión (dispositivo, ubicación, etc.)
   */
  async updateSessionInfo(
    sessionId: number,
    updates: {
      deviceInfo?: any;
      locationInfo?: any;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<void> {
    try {
      await this.sessionRepository.updateSessionInfo(sessionId, updates);

      this.logger.log(`Updated session info for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to update session info for session ${sessionId}`, error.stack);
      throw error;
    }
  }

  /**
   * Verifica sesión con 2FA
   */
  async verifyTwoFactor(sessionId: number): Promise<void> {
    try {
      await this.sessionRepository.markTwoFactorVerified(sessionId);

      this.logger.log(`2FA verified for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to verify 2FA for session ${sessionId}`, error.stack);
      throw error;
    }
  }

  /**
   * Maneja límite de sesiones concurrentes
   */
  private async checkConcurrentSessionLimit(userId: number, maxConcurrent: number = 5): Promise<void> {
    const activeSessions = await this.sessionRepository.getConcurrentSessions(userId, maxConcurrent);

    if (activeSessions.length >= maxConcurrent) {
      // Invalidar la sesión más antigua
      const oldestSession = activeSessions[activeSessions.length - 1];
      await this.invalidateSession(oldestSession.id, 'Concurrent session limit exceeded');

      this.logger.warn(`Concurrent session limit exceeded for user ${userId}. Invalidated oldest session ${oldestSession.id}`);
    }
  }

  /**
   * Fuerza logout de sesiones inactivas
   */
  async forceLogoutInactiveSessions(inactivityMinutes: number): Promise<number> {
    try {
      const loggedOutCount = await this.sessionRepository.forceLogoutInactiveSessions(inactivityMinutes);

      if (loggedOutCount > 0) {
        this.logger.log(`Forced logout of ${loggedOutCount} inactive sessions`);
      }

      return loggedOutCount;
    } catch (error) {
      this.logger.error('Failed to force logout inactive sessions', error.stack);
      throw error;
    }
  }

  /**
   * Limpia sesiones antiguas según política de retención
   */
  async cleanupOldSessions(retentionDays: number): Promise<number> {
    try {
      const cleanedCount = await this.sessionRepository.cleanupOldSessions(retentionDays);

      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} old sessions (retention: ${retentionDays} days)`);
      }

      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup old sessions', error.stack);
      throw error;
    }
  }

  /**
   * Obtiene resumen de sesiones para dashboard
   */
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
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats = await this.getSessionStatistics({
        startDate: weekAgo,
      });

      // Sesiones activas totales
      const totalActiveSessions = stats.activeSessions;

      // Sesiones creadas hoy
      const todayStats = await this.getSessionStatistics({
        startDate: today,
      });

      // Actividad reciente por usuario
      const recentActivity = stats.topUsersBySessions.slice(0, 10).map(user => ({
        userId: user.userId,
        sessionCount: user.sessionCount,
        lastActivity: new Date(), // Esto debería calcularse desde las sesiones reales
      }));

      return {
        totalActiveSessions,
        totalSessionsToday: todayStats.totalSessions,
        totalSessionsThisWeek: stats.totalSessions,
        sessionsByType: stats.sessionsByType,
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to get session dashboard summary', error.stack);
      throw error;
    }
  }
}