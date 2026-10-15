import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateAccessLogDto {
  @ApiProperty({ enum: ['exit', 'return', 'visit'] })
  @IsIn(['exit', 'return', 'visit'])
  eventType!: 'exit' | 'return' | 'visit';

  @ApiPropertyOptional({ example: 52, description: 'Residente asociado a la salida o regreso; opcional para una visita general.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  residentId?: number;

  @ApiPropertyOptional({ example: '2026-10-15T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiPropertyOptional({ example: '2026-10-15T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expectedReturnAt?: string;

  @ApiPropertyOptional({ example: 'María Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  visitorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class AccessLogFilterDto {
  @ApiPropertyOptional({ enum: ['exit', 'return', 'visit'] })
  @IsOptional()
  @IsIn(['exit', 'return', 'visit'])
  eventType?: 'exit' | 'return' | 'visit';

  @ApiPropertyOptional({ example: 52 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  residentId?: number;

  @ApiPropertyOptional({ example: 'María' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  visitorName?: string;

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
