import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchOlderAdultUpdatesDto {
  @ApiPropertyOptional({
    description: 'Filter by older adult ID',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  olderAdultId?: number;

  @ApiPropertyOptional({
    description: 'Filter by field changed',
    example: 'oa_status'
  })
  @IsOptional()
  @IsString()
  fieldChanged?: string;

  @ApiPropertyOptional({
    description: 'Filter by user who made the change',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  changedBy?: number;

  @ApiPropertyOptional({
    description: 'Filter changes from this date onwards',
    example: '2025-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter changes up to this date',
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
