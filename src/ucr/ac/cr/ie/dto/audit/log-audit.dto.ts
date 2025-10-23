import { IsEnum, IsString, IsInt, IsOptional, MaxLength, IsIP } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditReportType, AuditAction } from '../../domain/audit';

export class LogAuditDto {
  @ApiProperty({
    description: 'Type of audit action',
    enum: AuditReportType,
    example: 'login_attempts'
  })
  @IsEnum(AuditReportType)
  type: AuditReportType;

  @ApiPropertyOptional({
    description: 'Name of the affected table or entity',
    example: 'users',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entityName?: string;

  @ApiPropertyOptional({
    description: 'ID of the affected record',
    example: 5
  })
  @IsOptional()
  @IsInt()
  entityId?: number;

  @ApiProperty({
    description: 'Action performed',
    enum: AuditAction,
    example: 'login'
  })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiPropertyOptional({
    description: 'Previous value (for updates)',
    example: '{"age": 70}'
  })
  @IsOptional()
  @IsString()
  oldValue?: string;

  @ApiPropertyOptional({
    description: 'New value (for updates)',
    example: '{"age": 71}'
  })
  @IsOptional()
  @IsString()
  newValue?: string;

  @ApiPropertyOptional({
    description: 'IP address from where the action was performed',
    example: '192.168.1.10'
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent (browser/application information)',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Additional observations or notes',
    example: 'Ingreso exitoso al sistema'
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
