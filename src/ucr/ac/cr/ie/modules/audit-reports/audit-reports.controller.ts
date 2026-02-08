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
} from '@nestjs/swagger';
import { AuditReportsService } from './audit-reports.service';
import {
  GenerateAuditReportRequestDto,
  AuditReportFilterDto,
} from './dto/audit-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Audit Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit-reports')
export class AuditReportsController {
  constructor(private readonly auditReportsService: AuditReportsService) {}

  @Post()
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
  async generateAuditReport(@Req() req: any, @Body() generateDto: GenerateAuditReportRequestDto) {
    return this.auditReportsService.generateAuditReport(req.user.userId, generateDto);
  }

  @Get()
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
    return this.auditReportsService.getAuditReports(filterDto);
  }

  @Get(':id')
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
    return this.auditReportsService.getAuditReportDetail(id);
  }

  @Delete(':id')
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
    await this.auditReportsService.deleteAuditReport(id);
  }
}