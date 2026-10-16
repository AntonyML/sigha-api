import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { AdministrationStatus } from '../../domain/pharmacy';

export class KardexQueryDto {
    @ApiPropertyOptional({ description: 'Filtrar por ID del adulto mayor', example: 1 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    olderAdultId?: number;

    @ApiPropertyOptional({ description: 'Fecha de la hoja Kardex (YYYY-MM-DD)', example: '2026-10-14' })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional({ enum: AdministrationStatus, description: 'Filtrar por estado de administración' })
    @IsOptional()
    @IsIn([...Object.values(AdministrationStatus), 'suspended_absence'])
    status?: AdministrationStatus | 'suspended_absence';
}
