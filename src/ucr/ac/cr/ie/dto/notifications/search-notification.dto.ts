import { IsOptional, IsDateString, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchNotificationDto {
    @ApiPropertyOptional({
        description: 'Término de búsqueda en título o mensaje',
        example: 'reunión'
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Fecha inicio del rango de envío (ISO 8601)',
        example: '2025-10-21T00:00:00.000Z'
    })
    @IsOptional()
    @IsDateString()
    sendDateFrom?: string;

    @ApiPropertyOptional({
        description: 'Fecha fin del rango de envío (ISO 8601)',
        example: '2025-10-21T23:59:59.000Z'
    })
    @IsOptional()
    @IsDateString()
    sendDateTo?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por estado de envío',
        example: false
    })
    @IsOptional()
    @IsBoolean()
    nSent?: boolean;

    @ApiPropertyOptional({
        description: 'ID del remitente',
        example: 1
    })
    @IsOptional()
    @IsNumber()
    idSender?: number;

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