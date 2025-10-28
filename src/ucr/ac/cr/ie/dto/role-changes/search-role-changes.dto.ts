import { IsOptional, IsInt, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchRoleChangesDto {
    @ApiPropertyOptional({
        description: 'ID del usuario afectado',
        example: 5
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El ID del usuario debe ser un número entero' })
    idUser?: number;

    @ApiPropertyOptional({
        description: 'ID del administrador que realizó el cambio',
        example: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El ID del administrador debe ser un número entero' })
    changedBy?: number;

    @ApiPropertyOptional({
        description: 'Fecha de inicio (ISO 8601)',
        example: '2025-10-01T00:00:00.000Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de inicio debe estar en formato ISO 8601' })
    startDate?: string;

    @ApiPropertyOptional({
        description: 'Fecha de fin (ISO 8601)',
        example: '2025-10-31T23:59:59.999Z'
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha de fin debe estar en formato ISO 8601' })
    endDate?: string;

    @ApiPropertyOptional({
        description: 'Página (para paginación)',
        example: 1
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'La página debe ser un número entero' })
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Elementos por página',
        example: 10
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'El límite debe ser un número entero' })
    limit?: number = 10;
}