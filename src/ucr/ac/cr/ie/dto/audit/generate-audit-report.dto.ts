import { IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditReportType } from '../../domain/audit';

export class GenerateAuditReportDto {
  @ApiProperty({
    description: 'Type of audit report to generate',
    enum: AuditReportType,
    example: AuditReportType.GENERAL_ACTIONS
  })
  @IsEnum(AuditReportType)
  type: AuditReportType;

  @ApiProperty({
    description: 'Start date for the audit report (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z'
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for the audit report (ISO 8601)',
    example: '2025-12-31T23:59:59.999Z'
  })
  @IsDateString()
  endDate: string;
}

export class AuditReportFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by audit report type',
    enum: AuditReportType
  })
  @IsOptional()
  @IsEnum(AuditReportType)
  type?: AuditReportType;

  @ApiPropertyOptional({
    description: 'Filter reports from this date onwards',
    example: '2025-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter reports up to this date',
    example: '2025-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
