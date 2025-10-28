import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SecurityAuditService } from './security-audit.service';
import {
  CreateSecurityEventDto,
  SearchSecurityEventsDto,
  ResolveSecurityEventDto,
  SearchLoginAttemptsDto,
} from './dto/security-audit.dto';
import {
  SecurityEventResponse,
  LoginAttemptResponse,
  PaginatedSecurityEventsResponse,
  PaginatedLoginAttemptsResponse,
  SecurityStatisticsResponse,
} from './interfaces/security-audit.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Security Audit')
@ApiBearerAuth()
@Controller('security-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SecurityAuditController {
  constructor(private readonly securityAuditService: SecurityAuditService) {}

  @Post('events')
  @Roles('admin', 'super admin')
  @ApiOperation({ summary: 'Create a new security event' })
  @ApiResponse({
    status: 201,
    description: 'Security event created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createSecurityEvent(
    @Body() createDto: CreateSecurityEventDto,
    @Query('userId') userId?: number,
  ): Promise<SecurityEventResponse> {
    return this.securityAuditService.createSecurityEvent(createDto, userId);
  }

  @Get('events')
  @Roles('admin', 'super admin')
  @ApiOperation({ summary: 'Get paginated security events with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Security events retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSecurityEvents(
    @Query() searchDto: SearchSecurityEventsDto,
  ): Promise<PaginatedSecurityEventsResponse> {
    return this.securityAuditService.getSecurityEvents(searchDto);
  }

  @Put('events/:id/resolve')
  @Roles('admin', 'super admin')
  @ApiOperation({ summary: 'Resolve a security event' })
  @ApiResponse({
    status: 200,
    description: 'Security event resolved successfully',
  })
  @ApiResponse({ status: 404, description: 'Security event not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async resolveSecurityEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() resolveDto: ResolveSecurityEventDto,
    @Query('resolverId', ParseIntPipe) resolverId: number,
  ): Promise<SecurityEventResponse> {
    return this.securityAuditService.resolveSecurityEvent(id, resolveDto, resolverId);
  }

  @Get('login-attempts')
  @Roles('admin', 'super admin')
  @ApiOperation({ summary: 'Get paginated login attempts with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Login attempts retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getLoginAttempts(
    @Query() searchDto: SearchLoginAttemptsDto,
  ): Promise<PaginatedLoginAttemptsResponse> {
    return this.securityAuditService.getLoginAttempts(searchDto);
  }

  @Get('statistics')
  @Roles('admin', 'super admin')
  @ApiOperation({ summary: 'Get security audit statistics' })
  @ApiResponse({
    status: 200,
    description: 'Security statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getSecurityStatistics(): Promise<SecurityStatisticsResponse> {
    return this.securityAuditService.getSecurityStatistics();
  }
}