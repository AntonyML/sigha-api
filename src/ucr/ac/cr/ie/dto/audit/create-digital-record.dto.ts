import { IsEnum, IsString, IsOptional, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../../domain/audit';

export class CreateDigitalRecordDto {
  @ApiProperty({
    description: 'Action performed by the user',
    enum: AuditAction,
    example: AuditAction.CREATE
  })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiPropertyOptional({
    description: 'Table name affected by the action',
    example: 'older_adult',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tableName?: string;

  @ApiPropertyOptional({
    description: 'ID of the record affected',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  recordId?: number;

  @ApiPropertyOptional({
    description: 'Description of the action performed',
    example: 'Created new older adult with identification 123456789'
  })
  @IsOptional()
  @IsString()
  description?: string;
}
