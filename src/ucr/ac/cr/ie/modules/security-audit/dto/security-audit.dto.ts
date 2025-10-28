import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { SecurityEventType, SecuritySeverity } from '../../../domain/security-audit';

export class CreateSecurityEventDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsEnum(SecurityEventType)
  eventType: SecurityEventType;

  @IsEnum(SecuritySeverity)
  severity: SecuritySeverity;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: any;
}

export class SearchSecurityEventsDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsEnum(SecurityEventType)
  eventType?: SecurityEventType;

  @IsOptional()
  @IsEnum(SecuritySeverity)
  severity?: SecuritySeverity;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 50;
}

export class SearchLoginAttemptsDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsBoolean()
  successful?: boolean;

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

export class ResolveSecurityEventDto {
  @IsNumber()
  resolvedBy: number;

  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}