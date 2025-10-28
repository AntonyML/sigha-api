import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, In } from 'typeorm';
import { UserSession, SessionStatus, SessionType } from '../../domain/session-management/user-session.entity';

@Injectable()
export class SessionManagementRepository {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  /**
   * Crea una nueva sesión
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
    const session = this.sessionRepository.create({
      userId: sessionData.userId,
      sessionToken: sessionData.sessionToken,
      refreshToken: sessionData.refreshToken,
      sessionType: sessionData.sessionType || SessionType.WEB,
      ipAddress: sessionData.ipAddress,
      userAgent: sessionData.userAgent,
      deviceInfo: sessionData.deviceInfo,
      locationInfo: sessionData.locationInfo,
      expiresAt: sessionData.expiresAt,
      lastActivityAt: new Date(),
      loginAt: new Date(),
      status: SessionStatus.ACTIVE,
      loginAttempts: 0,
      isSecure: sessionData.isSecure || false,
      twoFactorVerified: sessionData.twoFactorVerified || false,
      metadata: sessionData.metadata,
    });

    return await this.sessionRepository.save(session);
  }

  /**
   * Encuentra sesión por token
   */
  async findBySessionToken(sessionToken: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { sessionToken, status: SessionStatus.ACTIVE },
    });
  }

  /**
   * Encuentra sesión por refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<UserSession | null> {
    return this.sessionRepository.findOne({
      where: { refreshToken, status: SessionStatus.ACTIVE },
    });
  }

  /**
   * Actualiza última actividad de sesión
   */
  async updateLastActivity(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivityAt: new Date(),
    });
  }

  /**
   * Invalida una sesión específica
   */
  async invalidateSession(sessionId: number, reason?: string): Promise<void> {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error(`Session with id ${sessionId} not found`);
    }

    // Usar query builder para actualizar metadata compleja
    const updatedMetadata = {
      ...(session.metadata || {}),
      invalidationReason: reason,
      invalidatedAt: new Date().toISOString(),
    };

    await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({
        status: SessionStatus.REVOKED,
        logoutAt: new Date(),
        metadata: updatedMetadata as any,
      })
      .where('id = :id', { id: sessionId })
      .execute();
  }

  /**
   * Invalida todas las sesiones de un usuario
   */
  async invalidateAllUserSessions(userId: number, reason?: string): Promise<number> {
    const metadataUpdate = {
      invalidationReason: reason || 'All sessions invalidated',
      invalidatedAt: new Date().toISOString(),
    };

    const result = await this.sessionRepository
      .createQueryBuilder()
      .update(UserSession)
      .set({
        status: SessionStatus.REVOKED,
        logoutAt: new Date(),
        metadata: metadataUpdate as any,
      })
      .where('userId = :userId AND status = :status', {
        userId,
        status: SessionStatus.ACTIVE,
      })
      .execute();

    return result.affected || 0;
  }

  /**
   * Invalida sesiones expiradas
   */
  async invalidateExpiredSessions(): Promise<number> {
    const result = await this.sessionRepository.update(
      {
        expiresAt: LessThan(new Date()),
        status: SessionStatus.ACTIVE,
      },
      {
        status: SessionStatus.EXPIRED,
        logoutAt: new Date(),
      },
    );

    return result.affected || 0;
  }

  /**
   * Obtiene sesiones activas de un usuario
   */
  async getActiveUserSessions(userId: number): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
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
    const where: any = { userId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.sessionType) {
      where.sessionType = filters.sessionType;
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThan(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThan(filters.endDate);
    }

    const query = this.sessionRepository
      .createQueryBuilder('session')
      .where(where)
      .orderBy('session.createdAt', 'DESC');

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
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
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.createdAt = MoreThan(filters.startDate);
    } else if (filters?.endDate) {
      where.createdAt = LessThan(filters.endDate);
    }

    // Total de sesiones
    const totalSessions = await this.sessionRepository.count({ where });

    // Sesiones por estado
    const sessionsByStatus = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('session.status')
      .getRawMany();

    const statusMap = sessionsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Sesiones por tipo
    const sessionsByType = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.sessionType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where(where)
      .groupBy('session.sessionType')
      .getRawMany();

    const typeMap = sessionsByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    // Duración promedio de sesiones
    const durationStats = await this.sessionRepository
      .createQueryBuilder('session')
      .select('AVG(EXTRACT(EPOCH FROM (COALESCE(session.logout_at, NOW()) - session.login_at)))', 'avgDuration')
      .where(where)
      .andWhere('session.login_at IS NOT NULL')
      .getRawOne();

    const averageSessionDuration = durationStats?.avgDuration ? parseFloat(durationStats.avgDuration) : 0;

    // Top usuarios por sesiones
    const topUsers = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.userId', 'userId')
      .addSelect('COUNT(*)', 'sessionCount')
      .where(where)
      .groupBy('session.userId')
      .orderBy('sessionCount', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsersBySessions = topUsers.map(item => ({
      userId: parseInt(item.userId),
      sessionCount: parseInt(item.sessionCount),
    }));

    return {
      totalSessions,
      activeSessions: statusMap[SessionStatus.ACTIVE] || 0,
      expiredSessions: statusMap[SessionStatus.EXPIRED] || 0,
      revokedSessions: statusMap[SessionStatus.REVOKED] || 0,
      sessionsByType: typeMap,
      sessionsByStatus: statusMap,
      averageSessionDuration,
      topUsersBySessions,
    };
  }

  /**
   * Verifica si una sesión es válida
   */
  async isSessionValid(sessionToken: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({
      where: {
        sessionToken,
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
    });

    return !!session;
  }

  /**
   * Extiende la expiración de una sesión
   */
  async extendSession(sessionId: number, newExpiry: Date): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      expiresAt: newExpiry,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Registra intento de login fallido
   */
  async recordFailedLogin(sessionId: number): Promise<void> {
    await this.sessionRepository.increment({ id: sessionId }, 'loginAttempts', 1);
  }

  /**
   * Limpia sesiones antiguas según política de retención
   */
  async cleanupOldSessions(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.sessionRepository.delete({
      createdAt: LessThan(cutoffDate),
      status: In([SessionStatus.EXPIRED, SessionStatus.REVOKED]),
    });

    return result.affected || 0;
  }

  /**
   * Obtiene sesiones sospechosas (múltiples IPs, ubicaciones, etc.)
   */
  async getSuspiciousSessions(timeframeHours: number = 24): Promise<UserSession[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - timeframeHours);

    // Sesiones con múltiples IPs para el mismo usuario en poco tiempo
    return this.sessionRepository
      .createQueryBuilder('session')
      .where('session.createdAt > :cutoffDate', { cutoffDate })
      .andWhere('session.status = :active', { active: SessionStatus.ACTIVE })
      .orderBy('session.userId')
      .addOrderBy('session.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Actualiza información de dispositivo y ubicación
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
    await this.sessionRepository.update(sessionId, {
      ...updates,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Marca sesión como verificada con 2FA
   */
  async markTwoFactorVerified(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      twoFactorVerified: true,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Obtiene sesiones concurrentes de un usuario
   */
  async getConcurrentSessions(userId: number, maxConcurrent: number = 5): Promise<UserSession[]> {
    return this.sessionRepository.find({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: MoreThan(new Date()),
      },
      order: { lastActivityAt: 'DESC' },
      take: maxConcurrent,
    });
  }

  /**
   * Fuerza logout de sesiones inactivas
   */
  async forceLogoutInactiveSessions(inactivityMinutes: number): Promise<number> {
    const inactivityCutoff = new Date();
    inactivityCutoff.setMinutes(inactivityCutoff.getMinutes() - inactivityMinutes);

    const result = await this.sessionRepository.update(
      {
        status: SessionStatus.ACTIVE,
        lastActivityAt: LessThan(inactivityCutoff),
      },
      {
        status: SessionStatus.INACTIVE,
        logoutAt: new Date(),
      },
    );

    return result.affected || 0;
  }
}