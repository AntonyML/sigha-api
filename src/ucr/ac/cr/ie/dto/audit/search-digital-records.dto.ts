import { IsEnum, IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AuditAction } from '../../domain/audit';

export class SearchDigitalRecordsDto {
  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: AuditAction,
    example: AuditAction.CREATE
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: 'Filter by table name',
    example: 'older_adult'
  })
  @IsOptional()
  @IsString()
  tableName?: string;

  @ApiPropertyOptional({
    description: 'Filter by record ID',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  recordId?: number;

  @ApiPropertyOptional({
    description: 'Filter records from this date onwards',
    example: '2025-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter records up to this date',
    example: '2025-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    example: 50,
    default: 50
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 50;
}
