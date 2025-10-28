import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { Repository, Between, MoreThan } from 'typeorm';
import { SecurityEvent, SecurityEventType, SecuritySeverity } from '../../domain/security-audit';
import { User } from '../../domain/auth/core/user.entity';
import {
  CreateSecurityEventDto,
  SearchSecurityEventsDto,
  ResolveSecurityEventDto,
  SearchLoginAttemptsDto
} from './dto/security-audit.dto';
import {
  SecurityEventResponse,
  LoginAttemptResponse,
  PaginatedSecurityEventsResponse,
  PaginatedLoginAttemptsResponse,
  SecurityStatisticsResponse
} from './interfaces/security-audit.interface';

@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);

  constructor(
    @Inject('SECURITY_EVENT_REPOSITORY')
    private readonly securityEventRepository: Repository<SecurityEvent>,
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {}

  async createSecurityEvent(createDto: CreateSecurityEventDto, userId?: number): Promise<SecurityEventResponse> {
    try {
      const event = this.securityEventRepository.create({
        ...createDto,
        userId,
      });

      const savedEvent = await this.securityEventRepository.save(event);
      this.logger.log(`Security event created: ${savedEvent.eventType} for user ${userId || 'unknown'}`);

      return this.mapToSecurityEventResponse(savedEvent);
    } catch (error) {
      this.logger.error(`Failed to create security event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSecurityEvents(searchDto: SearchSecurityEventsDto): Promise<PaginatedSecurityEventsResponse> {
    try {
      const { page = 1, limit = 10, userId, eventType, severity, resolved, startDate, endDate } = searchDto;
      const skip = (page - 1) * limit;

      const queryBuilder = this.securityEventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.user', 'user')
        .leftJoinAndSelect('event.resolver', 'resolver')
        .orderBy('event.createdAt', 'DESC');

      if (userId) {
        queryBuilder.andWhere('event.userId = :userId', { userId });
      }

      if (eventType) {
        queryBuilder.andWhere('event.eventType = :eventType', { eventType });
      }

      if (severity) {
        queryBuilder.andWhere('event.severity = :severity', { severity });
      }

      if (resolved !== undefined) {
        queryBuilder.andWhere('event.resolved = :resolved', { resolved });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      }

      const [events, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        events: events.map(event => this.mapToSecurityEventResponse(event)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Failed to get security events: ${error.message}`, error.stack);
      throw error;
    }
  }

  async resolveSecurityEvent(id: number, resolveDto: ResolveSecurityEventDto, resolverId: number): Promise<SecurityEventResponse> {
    try {
      const event = await this.securityEventRepository.findOne({
        where: { id },
        relations: ['user', 'resolver'],
      });

      if (!event) {
        throw new NotFoundException(`Security event with ID ${id} not found`);
      }

      event.resolved = true;
      event.resolvedAt = new Date();
      event.resolvedBy = resolverId;
      event.description = resolveDto.resolutionNotes || event.description;

      const updatedEvent = await this.securityEventRepository.save(event);
      this.logger.log(`Security event ${id} resolved by user ${resolverId}`);

      return this.mapToSecurityEventResponse(updatedEvent);
    } catch (error) {
      this.logger.error(`Failed to resolve security event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLoginAttempts(searchDto: SearchLoginAttemptsDto): Promise<PaginatedLoginAttemptsResponse> {
    try {
      const { page = 1, limit = 10, email, startDate, endDate, successful } = searchDto;
      const skip = (page - 1) * limit;

      // Get user by email if provided
      let userId: number | undefined;
      if (email) {
        const user = await this.userRepository.findOne({ where: { uEmail: email } });
        userId = user?.id;
      }

      const queryBuilder = this.securityEventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.user', 'user')
        .where('event.eventType IN (:...types)', {
          types: ['login_success', 'login_failed']
        })
        .orderBy('event.createdAt', 'DESC');

      if (userId) {
        queryBuilder.andWhere('event.userId = :userId', { userId });
      }

      if (successful !== undefined) {
        const eventType = successful ? 'login_success' : 'login_failed';
        queryBuilder.andWhere('event.eventType = :eventType', { eventType });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      }

      const [events, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return {
        attempts: events.map(event => this.mapToLoginAttemptResponse(event)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Failed to get login attempts: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSecurityStatistics(): Promise<SecurityStatisticsResponse> {
    try {
      const totalEvents = await this.securityEventRepository.count();

      // Events by type
      const eventsByType = await this.securityEventRepository
        .createQueryBuilder('event')
        .select('event.eventType', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('event.eventType')
        .getRawMany();

      const eventsByTypeMap = {};
      eventsByType.forEach(item => {
        eventsByTypeMap[item.type] = parseInt(item.count);
      });

      // Events by severity
      const eventsBySeverity = await this.securityEventRepository
        .createQueryBuilder('event')
        .select('event.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('event.severity')
        .getRawMany();

      const eventsBySeverityMap = {};
      eventsBySeverity.forEach(item => {
        eventsBySeverityMap[item.severity] = parseInt(item.count);
      });

      // Recent failed logins (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const recentFailedLogins = await this.securityEventRepository.count({
        where: {
          eventType: SecurityEventType.LOGIN_FAILED,
          createdAt: MoreThan(yesterday),
        },
      });

      // Suspicious activities (high severity unresolved events)
      const suspiciousActivities = await this.securityEventRepository.count({
        where: {
          severity: SecuritySeverity.HIGH,
          resolved: false,
        },
      });

      const resolvedEvents = await this.securityEventRepository.count({
        where: { resolved: true },
      });

      const unresolvedEvents = totalEvents - resolvedEvents;

      return {
        totalEvents,
        eventsByType: eventsByTypeMap,
        eventsBySeverity: eventsBySeverityMap,
        recentFailedLogins,
        suspiciousActivities,
        resolvedEvents,
        unresolvedEvents,
      };
    } catch (error) {
      this.logger.error(`Failed to get security statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapToSecurityEventResponse(event: SecurityEvent): SecurityEventResponse {
    return {
      id: event.id,
      userId: event.userId,
      userName: event.user?.uName,
      userEmail: event.user?.uEmail,
      eventType: event.eventType,
      severity: event.severity,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      location: event.location,
      deviceInfo: event.deviceInfo,
      description: event.description,
      metadata: event.metadata,
      resolved: event.resolved,
      resolvedAt: event.resolvedAt,
      resolvedBy: event.resolvedBy,
      resolverName: event.resolver?.uName,
      createdAt: event.createdAt,
    };
  }

  private mapToLoginAttemptResponse(event: SecurityEvent): LoginAttemptResponse {
    return {
      id: event.id,
      userId: event.userId,
      userName: event.user?.uName,
      email: event.user?.uEmail || '',
      ipAddress: event.ipAddress,
      attemptSuccessful: event.eventType === 'login_success',
      failureReason: event.eventType === 'login_failed' ? event.description : undefined,
      attemptedAt: event.createdAt,
    };
  }
}