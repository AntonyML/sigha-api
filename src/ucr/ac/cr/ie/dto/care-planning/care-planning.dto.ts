import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import type { EnrollmentStatus } from '../../domain/care-planning';

export class CreateCareProgramDto {
  @ApiProperty({ example: 'Atención integral' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class CreateCareSubProgramDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  programId!: number;

  @ApiProperty({ example: 'Movilidad y autonomía' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;
}

export class CreateResidentProgramEnrollmentDto {
  @ApiProperty({ example: 52 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  residentId!: number;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subprogramId!: number;

  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  scaleEvaluationId?: number;

  @ApiPropertyOptional({ example: 'Caminar 20 minutos con apoyo tres veces por semana.' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  goals?: string;

  @ApiPropertyOptional({ example: '2026-10-15T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;
}

export class UpdateResidentProgramEnrollmentDto {
  @ApiPropertyOptional({ enum: ['active', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum({ ACTIVE: 'active', COMPLETED: 'completed', CANCELLED: 'cancelled' })
  status?: EnrollmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  goals?: string;

  @ApiPropertyOptional({ example: 101 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  scaleEvaluationId?: number;

  @ApiPropertyOptional({ example: '2026-11-15T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional({ example: '2026-11-01T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endedAt?: string;
}

export class ResidentProgramEnrollmentFilterDto {
  @ApiPropertyOptional({ example: 52 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  residentId?: number;

  @ApiPropertyOptional({ enum: ['active', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum({ ACTIVE: 'active', COMPLETED: 'completed', CANCELLED: 'cancelled' })
  status?: EnrollmentStatus;
}
