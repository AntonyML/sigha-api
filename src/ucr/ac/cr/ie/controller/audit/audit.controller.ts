import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from '../../services/audit';
import {
  CreateDigitalRecordDto,
  GenerateAuditReportDto,
  SearchDigitalRecordsDto,
  SearchOlderAdultUpdatesDto,
  AuditReportFilterDto,
  LogAuditDto,
  AuditHistoryQueryDto,
} from '../../dto/audit';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get all audit records with pagination',
    description: 'Retrieve all digital audit records with pagination and filtering support.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit records retrieved successfully',
  })
  async getAllAudits(@Query() searchDto: SearchDigitalRecordsDto) {
    return this.auditService.searchDigitalRecords(searchDto);
  }

  @Get('stats')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit statistics',
    description: 'Retrieve audit statistics including counts by action type, entity, and recent activity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
  })
  async getAuditStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAuditStatistics(startDate, endDate);
  }

  @Get('search')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Search audit records with advanced filters',
    description: 'Search and filter digital audit records with advanced filtering options.',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchAudits(@Query() searchDto: SearchDigitalRecordsDto) {
    return this.auditService.searchDigitalRecords(searchDto);
  }

  @Get('user/:userId')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audits by user',
    description: 'Retrieve all audit records for a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User audit records retrieved successfully',
  })
  async getAuditsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() searchDto: SearchDigitalRecordsDto,
  ) {
    return this.auditService.searchDigitalRecords({ ...searchDto, userId });
  }

  @Get('entity/:entity/:entityId')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audits by entity',
    description: 'Retrieve all audit records for a specific entity and entity ID.',
  })
  @ApiParam({
    name: 'entity',
    description: 'Entity name (table name)',
    example: 'older_adult',
  })
  @ApiParam({
    name: 'entityId',
    description: 'Entity ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Entity audit records retrieved successfully',
  })
  async getAuditsByEntity(
    @Param('entity') entity: string,
    @Param('entityId', ParseIntPipe) entityId: number,
    @Query() searchDto: SearchDigitalRecordsDto,
  ) {
    return this.auditService.searchDigitalRecords({
      ...searchDto,
      tableName: entity,
      recordId: entityId,
    });
  }

  @Get(':id')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit record by ID',
    description: 'Retrieve a specific audit record by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Audit record ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit record retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit record not found',
  })
  async getAuditById(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.getDigitalRecordById(id);
  }

  @Post()
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Create audit record (manual logging)',
    description: 'Manually create an audit log entry. Typically used for important actions that need explicit logging.',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit record created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async createAudit(@Req() req: any, @Body() createDto: CreateDigitalRecordDto) {
    return this.auditService.createDigitalRecord(req.user.userId, createDto);
  }

  @Get('older-adult-updates')
  @Roles('super admin', 'admin', 'director', 'nurse', 'physiotherapist', 'psychologist', 'social worker')
  @ApiOperation({
    summary: 'Search older adult update records',
    description: 'Search and filter older adult data change history with pagination support.',
  })
  @ApiResponse({
    status: 200,
    description: 'Older adult updates retrieved successfully',
  })
  async searchOlderAdultUpdates(@Query() searchDto: SearchOlderAdultUpdatesDto) {
    return this.auditService.searchOlderAdultUpdates(searchDto);
  }

  @Post('reports')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Generate audit report',
    description: 'Generate a comprehensive audit report for a specific type and date range.',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit report generated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid date range or parameters',
  })
  async generateAuditReport(@Req() req: any, @Body() generateDto: GenerateAuditReportDto) {
    return this.auditService.generateAuditReport(req.user.userId, generateDto);
  }

  @Get('reports')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get all audit reports',
    description: 'Retrieve all generated audit reports with optional filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit reports retrieved successfully',
  })
  async getAuditReports(@Query() filterDto: AuditReportFilterDto) {
    return this.auditService.getAuditReports(filterDto);
  }

  @Get('reports/:id')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Get audit report details',
    description: 'Retrieve detailed information and data for a specific audit report.',
  })
  @ApiParam({
    name: 'id',
    description: 'Audit report ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Audit report details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit report not found',
  })
  async getAuditReportDetail(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.getAuditReportDetail(id);
  }

  @Delete('reports/:id')
  @Roles('super admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete audit report',
    description: 'Delete an audit report. Only super admin can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Audit report ID',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Audit report deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit report not found',
  })
  async deleteAuditReport(@Param('id', ParseIntPipe) id: number) {
    await this.auditService.deleteAuditReport(id);
  }

  @Post('log')
  @Roles('super admin', 'admin', 'director', 'nurse', 'physiotherapist', 'psychologist', 'social worker')
  @ApiOperation({
    summary: 'Log audit action using stored procedure',
    description: 'Create an audit log entry using the sp_log_audit stored procedure. This is the recommended method for centralized audit logging.',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit action logged successfully',
    schema: {
      example: {
        success: true,
        message: 'Audit log created successfully via stored procedure',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async logAudit(@Req() req: any, @Body() logDto: LogAuditDto) {
    return this.auditService.logAuditWithStoredProcedure(req.user.userId, logDto);
  }

  @Get('digital-records/:recordId/history')
  @Roles('super admin', 'admin', 'director', 'nurse')
  @ApiOperation({
    summary: 'Get audit history for a digital record',
    description: 'Retrieve paginated audit history for a specific digital record with user information and filtering.',
  })
  @ApiParam({
    name: 'recordId',
    description: 'Digital record ID',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit history retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          records: [
            {
              id: 1,
              recordId: '123',
              entityType: 'digital_record',
              action: 'update',
              timestamp: '2024-01-15T10:30:00Z',
              user: {
                userId: 5,
                userName: 'Juan Pérez',
                userEmail: 'juan.perez@example.com',
              },
              changes: {
                before: { status: 'draft' },
                after: { status: 'published' },
              },
              metadata: {
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...',
              },
              observations: 'Updated document status',
            },
          ],
          pagination: {
            currentPage: 1,
            totalPages: 5,
            totalRecords: 100,
            limit: 50,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getDigitalRecordHistory(
    @Param('recordId') recordId: string,
    @Query() queryDto: AuditHistoryQueryDto,
  ) {
    return this.auditService.getDigitalRecordAuditHistory(recordId, queryDto);
  }
}

