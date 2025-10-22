import { IsEnum, IsOptional, IsDateString, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EntranceExitType, AccessType } from '../../domain/entrances-exits/entrance-exit.entity';

export class SearchEntranceExitDto {
    @ApiPropertyOptional({
        description: 'Filtrar por tipo de persona/entidad',
        enum: EntranceExitType
    })
    @IsOptional()
    @IsEnum(EntranceExitType)
    eeType?: EntranceExitType;

    @ApiPropertyOptional({
        description: 'Filtrar por tipo de acceso',
        enum: AccessType
    })
    @IsOptional()
    @IsEnum(AccessType)
    eeAccessType?: AccessType;

    @ApiPropertyOptional({
        description: 'Fecha inicio del rango de búsqueda (ISO 8601)',
        example: '2025-10-21T00:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({
        description: 'Fecha fin del rango de búsqueda (ISO 8601)',
        example: '2025-10-21T23:59:59.000Z'
    })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por estado del ciclo (cerrado o no)',
        example: false
    })
    @IsOptional()
    @IsBoolean()
    eeClose?: boolean;

    @ApiPropertyOptional({
        description: 'Término de búsqueda en nombre, apellidos o identificación',
        example: 'Juan'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Página para paginación',
        example: 1
    })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({
        description: 'Elementos por página',
        example: 10
    })
    @IsOptional()
    limit?: number;
}