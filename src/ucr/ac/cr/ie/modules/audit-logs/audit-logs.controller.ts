import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto, SearchAuditLogsDto } from './dto/audit-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get all audit logs with pagination and filtering',
    description: 'Retrieve all audit logs with advanced filtering and pagination support.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  async getAllAuditLogs(@Query() searchDto: SearchAuditLogsDto) {
    return this.auditLogsService.searchAuditLogs(searchDto);
  }

  @Get('stats')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit logs statistics',
    description: 'Retrieve audit logs statistics including counts by action type, entity, and recent activity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs statistics retrieved successfully',
  })
  async getAuditLogsStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditLogsService.getAuditStatistics(startDate, endDate);
  }

  @Get('user/:userId')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit logs by user',
    description: 'Retrieve all audit logs for a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved successfully',
  })
  async getAuditLogsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() searchDto: SearchAuditLogsDto,
  ) {
    return this.auditLogsService.searchAuditLogs({ ...searchDto, userId });
  }

  @Get('entity/:entity/:entityId')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit logs by entity',
    description: 'Retrieve all audit logs for a specific entity and entity ID.',
  })
  @ApiParam({
    name: 'entity',
    description: 'Entity name',
    example: 'older_adult',
  })
  @ApiParam({
    name: 'entityId',
    description: 'Entity ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Entity audit logs retrieved successfully',
  })
  async getAuditLogsByEntity(
    @Param('entity') entity: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query() searchDto: SearchAuditLogsDto,
  ) {
    return this.auditLogsService.searchAuditLogs({
      ...searchDto,
      entityName: entity as any,
      entityId,
    });
  }

  @Get(':id')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit log by ID',
    description: 'Retrieve a specific audit log by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Audit log ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found',
  })
  async getAuditLogById(@Param('id', ParseIntPipe) id: number) {
    return this.auditLogsService.getAuditLogById(id);
  }

  @Post()
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Create audit log (manual logging)',
    description: 'Manually create an audit log entry. Typically used for important actions that need explicit logging.',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit log created successfully',
  })
  async createAuditLog(@Body() createDto: CreateAuditLogDto) {
    // Note: In a real implementation, you'd get the userId from the request context
    // For now, this is a placeholder - the actual implementation would need user context
    return { message: 'Audit log creation endpoint - requires user context implementation' };
  }
}