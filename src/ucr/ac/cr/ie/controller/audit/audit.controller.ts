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
} from '../../dto/audit';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('digital-records')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Create a digital record (manual logging)',
    description: 'Manually create an audit log entry. Typically used for important actions that need explicit logging.',
  })
  @ApiResponse({
    status: 201,
    description: 'Digital record created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async createDigitalRecord(@Req() req: any, @Body() createDto: CreateDigitalRecordDto) {
    return this.auditService.createDigitalRecord(req.user.userId, createDto);
  }

  @Get('digital-records')
  @Roles('super admin', 'admin', 'director')
  @ApiOperation({
    summary: 'Search digital records',
    description: 'Search and filter digital audit records with pagination support.',
  })
  @ApiResponse({
    status: 200,
    description: 'Digital records retrieved successfully',
  })
  async searchDigitalRecords(@Query() searchDto: SearchDigitalRecordsDto) {
    return this.auditService.searchDigitalRecords(searchDto);
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
}
