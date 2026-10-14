import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { AdministrationRoute } from '../../domain/pharmacy';

export class CreateMedicationCatalogDto {
    @ApiProperty({ description: 'Nombre comercial o descriptivo del medicamento', example: 'Enalapril 20mg' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    name: string;

    @ApiProperty({ description: 'Principio activo', example: 'Enalapril' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(150)
    activeSubstance: string;

    @ApiProperty({ description: 'Concentración', example: '20 mg' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    concentration: string;

    @ApiProperty({ description: 'Forma farmacéutica', example: 'tableta' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    pharmaceuticalForm: string;

    @ApiPropertyOptional({ enum: AdministrationRoute, default: AdministrationRoute.ORAL })
    @IsOptional()
    @IsEnum(AdministrationRoute)
    defaultRoute?: AdministrationRoute;

    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
