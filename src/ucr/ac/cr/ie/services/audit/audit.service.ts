import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditReport, DigitalRecord, OlderAdultUpdate, AuditReportType, AuditAction } from '../../domain/audit';
import { User } from '../../domain/auth/core/user.entity';
import { RoleChange } from '../../domain/roles/role-change.entity';
import { LoginAttempt } from '../../domain/auth/security/login-attempt.entity';
import {
  CreateDigitalRecordDto,
  GenerateAuditReportDto,
  SearchDigitalRecordsDto,
  SearchOlderAdultUpdatesDto,
  AuditReportFilterDto,
} from '../../dto/audit';
import {
  AuditReportResponse,
  AuditReportDetailResponse,
  GenerateAuditReportResponse,
  DigitalRecordResponse,
  PaginatedDigitalRecordsResponse,
  OlderAdultUpdateResponse,
  PaginatedOlderAdultUpdatesResponse,
} from '../../interfaces/audit';

@Injectable()
export class AuditService {
  constructor(
    @Inject('AUDIT_REPORT_REPOSITORY')
    private auditReportRepository: Repository<AuditReport>,
    @Inject('DIGITAL_RECORD_REPOSITORY')
    private digitalRecordRepository: Repository<DigitalRecord>,
    @Inject('OLDER_ADULT_UPDATE_REPOSITORY')
    private olderAdultUpdateRepository: Repository<OlderAdultUpdate>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    @Inject('ROLE_CHANGE_REPOSITORY')
    private roleChangeRepository: Repository<RoleChange>,
    @Inject('LOGIN_ATTEMPT_REPOSITORY')
    private loginAttemptRepository: Repository<LoginAttempt>,
  ) {}

  async createDigitalRecord(
    userId: number,
    createDto: CreateDigitalRecordDto,
  ): Promise<DigitalRecordResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const record = this.digitalRecordRepository.create({
      drUserId: userId,
      drAction: createDto.action,
      drTableName: createDto.tableName,
      drRecordId: createDto.recordId,
      drDescription: createDto.description,
    });

    const savedRecord = await this.digitalRecordRepository.save(record);

    return {
      id: savedRecord.id,
      userId: savedRecord.drUserId,
      userName: `${user.uName} ${user.uFLastName}`,
      userEmail: user.uEmail,
      action: savedRecord.drAction,
      tableName: savedRecord.drTableName,
      recordId: savedRecord.drRecordId,
      description: savedRecord.drDescription,
      timestamp: savedRecord.drTimestamp,
    };
  }

  async logAction(
    userId: number,
    action: AuditAction,
    tableName?: string,
    recordId?: number,
    description?: string,
  ): Promise<void> {
    try {
      await this.createDigitalRecord(userId, {
        action,
        tableName,
        recordId,
        description,
      });
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }

  async searchDigitalRecords(
    searchDto: SearchDigitalRecordsDto,
  ): Promise<PaginatedDigitalRecordsResponse> {
    const { userId, action, tableName, recordId, startDate, endDate, page = 1, limit = 50 } = searchDto;

    const whereConditions: any = {};

    if (userId) whereConditions.drUserId = userId;
    if (action) whereConditions.drAction = action;
    if (tableName) whereConditions.drTableName = tableName;
    if (recordId) whereConditions.drRecordId = recordId;

    if (startDate && endDate) {
      whereConditions.drTimestamp = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereConditions.drTimestamp = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereConditions.drTimestamp = LessThanOrEqual(new Date(endDate));
    }

    const [records, total] = await this.digitalRecordRepository.findAndCount({
      where: whereConditions,
      relations: ['user'],
      order: { drTimestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedRecords: DigitalRecordResponse[] = records.map(record => ({
      id: record.id,
      userId: record.drUserId,
      userName: `${record.user.uName} ${record.user.uFLastName}`,
      userEmail: record.user.uEmail,
      action: record.drAction,
      tableName: record.drTableName,
      recordId: record.drRecordId,
      description: record.drDescription,
      timestamp: record.drTimestamp,
    }));

    return {
      records: mappedRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchOlderAdultUpdates(
    searchDto: SearchOlderAdultUpdatesDto,
  ): Promise<PaginatedOlderAdultUpdatesResponse> {
    const { olderAdultId, fieldChanged, changedBy, startDate, endDate, page = 1, limit = 50 } = searchDto;

    const whereConditions: any = {};

    if (olderAdultId) whereConditions.idOlderAdult = olderAdultId;
    if (fieldChanged) whereConditions.oauFieldChanged = fieldChanged;
    if (changedBy) whereConditions.changedBy = changedBy;

    if (startDate && endDate) {
      whereConditions.changedAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereConditions.changedAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereConditions.changedAt = LessThanOrEqual(new Date(endDate));
    }

    const [updates, total] = await this.olderAdultUpdateRepository.findAndCount({
      where: whereConditions,
      relations: ['changedByUser'],
      order: { changedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedUpdates: OlderAdultUpdateResponse[] = updates.map(update => ({
      id: update.id,
      fieldChanged: update.oauFieldChanged,
      oldValue: update.oauOldValue,
      newValue: update.oauNewValue,
      changedAt: update.changedAt,
      olderAdultId: update.idOlderAdult,
      changedBy: {
        id: update.changedByUser.id,
        name: `${update.changedByUser.uName} ${update.changedByUser.uFLastName}`,
        email: update.changedByUser.uEmail,
      },
    }));

    return {
      updates: mappedUpdates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async generateAuditReport(
    generatorId: number,
    generateDto: GenerateAuditReportDto,
  ): Promise<GenerateAuditReportResponse> {
    const { type, startDate, endDate } = generateDto;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    const generator = await this.userRepository.findOne({ where: { id: generatorId } });
    if (!generator) {
      throw new NotFoundException(`User with ID ${generatorId} not found`);
    }

    const lastAuditNumber = await this.auditReportRepository
      .createQueryBuilder('audit')
      .select('MAX(audit.arAuditNumber)', 'max')
      .getRawOne();

    const newAuditNumber = (lastAuditNumber?.max || 0) + 1;

    let dataCount = 0;

    switch (type) {
      case AuditReportType.GENERAL_ACTIONS:
        dataCount = await this.digitalRecordRepository.count({
          where: { drTimestamp: Between(start, end) },
        });
        break;
      case AuditReportType.ROLE_CHANGES:
        dataCount = await this.roleChangeRepository.count({
          where: { changedAt: Between(start, end) },
        });
        break;
      case AuditReportType.OLDER_ADULT_UPDATES:
        dataCount = await this.olderAdultUpdateRepository.count({
          where: { changedAt: Between(start, end) },
        });
        break;
      case AuditReportType.SYSTEM_ACCESS:
        dataCount = await this.loginAttemptRepository.count({
          where: { attemptedAt: Between(start, end) },
        });
        break;
      default:
        dataCount = 0;
    }

    const auditReport = this.auditReportRepository.create({
      arAuditNumber: newAuditNumber,
      arType: type,
      arStartDate: start,
      arEndDate: end,
      idGenerator: generatorId,
    });

    const savedReport = await this.auditReportRepository.save(auditReport);

    return {
      success: true,
      message: `Audit report #${newAuditNumber} generated successfully`,
      report: {
        id: savedReport.id,
        auditNumber: savedReport.arAuditNumber,
        type: savedReport.arType,
        startDate: savedReport.arStartDate,
        endDate: savedReport.arEndDate,
        createdAt: savedReport.createAt,
        generatedBy: {
          id: generator.id,
          name: `${generator.uName} ${generator.uFLastName}`,
          email: generator.uEmail,
        },
      },
      dataCount,
    };
  }

  async getAuditReports(filterDto?: AuditReportFilterDto): Promise<AuditReportResponse[]> {
    const whereConditions: any = {};

    if (filterDto?.type) {
      whereConditions.arType = filterDto.type;
    }

    if (filterDto?.startDate && filterDto?.endDate) {
      whereConditions.createAt = Between(new Date(filterDto.startDate), new Date(filterDto.endDate));
    } else if (filterDto?.startDate) {
      whereConditions.createAt = MoreThanOrEqual(new Date(filterDto.startDate));
    } else if (filterDto?.endDate) {
      whereConditions.createAt = LessThanOrEqual(new Date(filterDto.endDate));
    }

    const reports = await this.auditReportRepository.find({
      where: whereConditions,
      relations: ['generator'],
      order: { createAt: 'DESC' },
    });

    return reports.map(report => ({
      id: report.id,
      auditNumber: report.arAuditNumber,
      type: report.arType,
      startDate: report.arStartDate,
      endDate: report.arEndDate,
      createdAt: report.createAt,
      generatedBy: {
        id: report.generator.id,
        name: `${report.generator.uName} ${report.generator.uFLastName}`,
        email: report.generator.uEmail,
      },
    }));
  }

  async getAuditReportDetail(reportId: number): Promise<AuditReportDetailResponse> {
    const report = await this.auditReportRepository.findOne({
      where: { id: reportId },
      relations: ['generator'],
    });

    if (!report) {
      throw new NotFoundException(`Audit report with ID ${reportId} not found`);
    }

    let data: any[] = [];
    let totalRecords = 0;

    switch (report.arType) {
      case AuditReportType.GENERAL_ACTIONS:
        data = await this.digitalRecordRepository.find({
          where: { drTimestamp: Between(report.arStartDate, report.arEndDate) },
          relations: ['user'],
          order: { drTimestamp: 'DESC' },
        });
        totalRecords = data.length;
        break;
      case AuditReportType.ROLE_CHANGES:
        data = await this.roleChangeRepository.find({
          where: { changedAt: Between(report.arStartDate, report.arEndDate) },
          order: { changedAt: 'DESC' },
        });
        totalRecords = data.length;
        break;
      case AuditReportType.OLDER_ADULT_UPDATES:
        data = await this.olderAdultUpdateRepository.find({
          where: { changedAt: Between(report.arStartDate, report.arEndDate) },
          relations: ['changedByUser'],
          order: { changedAt: 'DESC' },
        });
        totalRecords = data.length;
        break;
      case AuditReportType.SYSTEM_ACCESS:
        data = await this.loginAttemptRepository.find({
          where: { attemptedAt: Between(report.arStartDate, report.arEndDate) },
          order: { attemptedAt: 'DESC' },
        });
        totalRecords = data.length;
        break;
    }

    return {
      id: report.id,
      auditNumber: report.arAuditNumber,
      type: report.arType,
      startDate: report.arStartDate,
      endDate: report.arEndDate,
      createdAt: report.createAt,
      generatedBy: {
        id: report.generator.id,
        name: `${report.generator.uName} ${report.generator.uFLastName}`,
        email: report.generator.uEmail,
      },
      data,
      totalRecords,
    };
  }

  async deleteAuditReport(reportId: number): Promise<void> {
    const report = await this.auditReportRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException(`Audit report with ID ${reportId} not found`);
    }
    await this.auditReportRepository.remove(report);
  }

  async getDigitalRecordById(id: number): Promise<DigitalRecordResponse> {
    const record = await this.digitalRecordRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!record) {
      throw new NotFoundException(`Digital record with ID ${id} not found`);
    }

    return {
      id: record.id,
      userId: record.drUserId,
      userName: `${record.user.uName} ${record.user.uFLastName}`,
      userEmail: record.user.uEmail,
      action: record.drAction,
      tableName: record.drTableName,
      recordId: record.drRecordId,
      description: record.drDescription,
      timestamp: record.drTimestamp,
    };
  }

  async getAuditStatistics(startDate?: string, endDate?: string): Promise<any> {
    const whereConditions: any = {};

    if (startDate && endDate) {
      whereConditions.drTimestamp = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereConditions.drTimestamp = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      whereConditions.drTimestamp = LessThanOrEqual(new Date(endDate));
    }

    const totalActions = await this.digitalRecordRepository.count({ where: whereConditions });

    const actionsByType = await this.digitalRecordRepository
      .createQueryBuilder('record')
      .select('record.drAction', 'action')
      .addSelect('COUNT(*)', 'count')
      .where(whereConditions.drTimestamp ? 'record.drTimestamp BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        end: endDate,
      })
      .groupBy('record.drAction')
      .getRawMany();

    const actionsByEntity = await this.digitalRecordRepository
      .createQueryBuilder('record')
      .select('record.drTableName', 'entity')
      .addSelect('COUNT(*)', 'count')
      .where(whereConditions.drTimestamp ? 'record.drTimestamp BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        end: endDate,
      })
      .andWhere('record.drTableName IS NOT NULL')
      .groupBy('record.drTableName')
      .getRawMany();

    const topUsers = await this.digitalRecordRepository
      .createQueryBuilder('record')
      .leftJoin('record.user', 'user')
      .select('user.id', 'userId')
      .addSelect('CONCAT(user.uName, " ", user.uFLastName)', 'username')
      .addSelect('COUNT(*)', 'actionCount')
      .where(whereConditions.drTimestamp ? 'record.drTimestamp BETWEEN :start AND :end' : '1=1', {
        start: startDate,
        end: endDate,
      })
      .groupBy('user.id')
      .orderBy('actionCount', 'DESC')
      .limit(10)
      .getRawMany();

    const recentActivity = await this.digitalRecordRepository.find({
      where: whereConditions,
      relations: ['user'],
      order: { drTimestamp: 'DESC' },
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
      recentActivity: recentActivity.map(record => ({
        id: record.id,
        userId: record.drUserId,
        userName: `${record.user.uName} ${record.user.uFLastName}`,
        userEmail: record.user.uEmail,
        action: record.drAction,
        tableName: record.drTableName,
        recordId: record.drRecordId,
        description: record.drDescription,
        timestamp: record.drTimestamp,
      })),
    };
  }
}
