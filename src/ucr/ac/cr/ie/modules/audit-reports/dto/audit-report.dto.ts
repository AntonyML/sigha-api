import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { AuditReportType } from '../../../domain/audit';

export class GenerateAuditReportDto {
  @IsEnum(AuditReportType)
  type: AuditReportType;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AuditReportFilterDto {
  @IsOptional()
  @IsEnum(AuditReportType)
  type?: AuditReportType;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  generatorId?: number;
}