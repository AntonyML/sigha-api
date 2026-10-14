import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class Icd10QueryDto {
    @ApiPropertyOptional({ description: 'Buscar por código CIE-10 o descripción', example: 'I10' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Filtrar por categoría CIE-10', example: 'Enfermedades del sistema circulatorio' })
    @IsOptional()
    @IsString()
    category?: string;
}
