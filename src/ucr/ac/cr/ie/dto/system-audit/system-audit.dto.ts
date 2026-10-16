import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SystemAuditFilterDto {
  @ApiPropertyOptional({ example: 'resident_program_enrollments' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tableName?: string;

  @ApiPropertyOptional({ example: '127' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recordId?: string;

  @ApiPropertyOptional({ enum: ['INSERT', 'UPDATE', 'DELETE'] })
  @IsOptional()
  @IsIn(['INSERT', 'UPDATE', 'DELETE'])
  action?: 'INSERT' | 'UPDATE' | 'DELETE';

  @ApiPropertyOptional({ example: 9 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  actorUserId?: number;

  @ApiPropertyOptional({ example: '2026-10-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-10-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 25, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 25;
}
