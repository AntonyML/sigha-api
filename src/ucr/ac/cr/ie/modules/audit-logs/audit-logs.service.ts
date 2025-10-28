import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLog, AuditLogAction, AuditEntity } from '../../domain/audit-logs';
import { User } from '../../domain/auth/core/user.entity';
import { CreateAuditLogDto, SearchAuditLogsDto } from './dto/audit-log.dto';
import { AuditLogResponse, PaginatedAuditLogsResponse } from './interfaces/audit-log.interface';

@Injectable()
export class AuditLogsService {
  constructor(
    @Inject('AUDIT_LOG_REPOSITORY')
    private auditLogRepository: Repository<AuditLog>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async createAuditLog(userId: number, createDto: CreateAuditLogDto): Promise<AuditLogResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const auditLog = this.auditLogRepository.create({
      userId,
      action: createDto.action,
      entityName: createDto.entityName,
      entityId: createDto.entityId,
      oldValue: createDto.oldValue,
      newValue: createDto.newValue,
      description: createDto.description,
      ipAddress: createDto.ipAddress,
      userAgent: createDto.userAgent,
      sessionId: createDto.sessionId,
    });

    const savedLog = await this.auditLogRepository.save(auditLog);

    return {
      id: savedLog.id,
      userId: savedLog.userId,
      userName: `${user.uName} ${user.uFLastName}`,
      userEmail: user.uEmail,
      action: savedLog.action,
      entityName: savedLog.entityName,
      entityId: savedLog.entityId,
      oldValue: savedLog.oldValue,
      newValue: savedLog.newValue,
      description: savedLog.description,
      ipAddress: savedLog.ipAddress,
      userAgent: savedLog.userAgent,
      sessionId: savedLog.sessionId,
      createdAt: savedLog.createdAt,
    };
  }

  async logAction(
    userId: number,
    action: AuditLogAction,
    entityName: AuditEntity,
    entityId?: number,
    description?: string,
    oldValue?: string,
    newValue?: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): Promise<void> {
    try {
      await this.createAuditLog(userId, {
        action,
        entityName,
        entityId,
        description,
        oldValue,
        newValue,
        ipAddress,
        userAgent,
        sessionId,
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }

  async searchAuditLogs(searchDto: SearchAuditLogsDto): Promise<PaginatedAuditLogsResponse> {
    const {
      userId,
      action,
      entityName,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = searchDto;

    const whereConditions: any = {};

    if (userId) whereConditions.userId = userId;
    if (action) whereConditions.action = action;
    if (entityName) whereConditions.entityName = entityName;
    if (entityId) whereConditions.entityId = entityId;

    if (startDate && endDate) {
      whereConditions.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereConditions.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereConditions.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const [logs, total] = await this.auditLogRepository.findAndCount({
      where: whereConditions,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedLogs: AuditLogResponse[] = logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userName: `${log.user.uName} ${log.user.uFLastName}`,
      userEmail: log.user.uEmail,
      action: log.action,
      entityName: log.entityName,
      entityId: log.entityId,
      oldValue: log.oldValue,
      newValue: log.newValue,
      description: log.description,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      createdAt: log.createdAt,
    }));

    return {
      logs: mappedLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditLogById(id: number): Promise<AuditLogResponse> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return {
      id: log.id,
      userId: log.userId,
      userName: `${log.user.uName} ${log.user.uFLastName}`,
      userEmail: log.user.uEmail,
      action: log.action,
      entityName: log.entityName,
      entityId: log.entityId,
      oldValue: log.oldValue,
      newValue: log.newValue,
      description: log.description,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      sessionId: log.sessionId,
      createdAt: log.createdAt,
    };
  }

  async getAuditStatistics(startDate?: string, endDate?: string): Promise<any> {
    const whereConditions: any = {};

    if (startDate && endDate) {
      whereConditions.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereConditions.createdAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereConditions.createdAt = LessThanOrEqual(new Date(endDate));
    }

    const totalActions = await this.auditLogRepository.count({ where: whereConditions });

    const actionsByType = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where(whereConditions.createdAt ? 'log.createdAt BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        endDate,
      })
      .groupBy('log.action')
      .getRawMany();

    const actionsByEntity = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('log.entityName', 'entity')
      .addSelect('COUNT(*)', 'count')
      .where(whereConditions.createdAt ? 'log.createdAt BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        endDate,
      })
      .andWhere('log.entityName IS NOT NULL')
      .groupBy('log.entityName')
      .getRawMany();

    const topUsers = await this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoin('log.user', 'user')
      .select('user.id', 'userId')
      .addSelect('CONCAT(user.uName, " ", user.uFLastName)', 'username')
      .addSelect('COUNT(*)', 'actionCount')
      .where(whereConditions.createdAt ? 'log.createdAt BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        endDate,
      })
      .groupBy('user.id')
      .orderBy('actionCount', 'DESC')
      .limit(10)
      .getRawMany();

    const recentActivity = await this.auditLogRepository.find({
      where: whereConditions,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const formattedActionsByType: Record<string, number> = {};
    actionsByType.forEach(item => {
      formattedActionsByType[item.action] = parseInt(item.count);
    });

    const formattedActionsByEntity: Record<string, number> = {};
    actionsByEntity.forEach(item => {
      formattedActionsByEntity[item.entity || 'OTHER'] = parseInt(item.count);
    });

    return {
      totalActions,
      actionsByType: formattedActionsByType,
      actionsByEntity: formattedActionsByEntity,
      topUsers: topUsers.map(user => ({
        userId: user.userId,
        username: user.username,
        actionCount: parseInt(user.actionCount),
      })),
      recentActivity: recentActivity.map(log => ({
        id: log.id,
        userId: log.userId,
        userName: `${log.user.uName} ${log.user.uFLastName}`,
        userEmail: log.user.uEmail,
        action: log.action,
        entityName: log.entityName,
        entityId: log.entityId,
        description: log.description,
        timestamp: log.createdAt,
      })),
    };
  }
}