import { IsEnum, IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { AuditLogAction, AuditEntity } from '../../../domain/audit-logs';

export class CreateAuditLogDto {
  @IsEnum(AuditLogAction)
  action: AuditLogAction;

  @IsEnum(AuditEntity)
  entityName: AuditEntity;

  @IsOptional()
  @IsNumber()
  entityId?: number;

  @IsOptional()
  @IsString()
  oldValue?: string;

  @IsOptional()
  @IsString()
  newValue?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class SearchAuditLogsDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsEnum(AuditLogAction)
  action?: AuditLogAction;

  @IsOptional()
  @IsEnum(AuditEntity)
  entityName?: AuditEntity;

  @IsOptional()
  @IsNumber()
  entityId?: number;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}