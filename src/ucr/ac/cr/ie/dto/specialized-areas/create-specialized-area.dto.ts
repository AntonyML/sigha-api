import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { SpecializedAreaName } from '../../domain/nursing';

export class CreateSpecializedAreaDto {
    @ApiPropertyOptional({ description: 'Area name', enum: SpecializedAreaName, example: SpecializedAreaName.NURSING })
    @IsOptional()
    @IsEnum(SpecializedAreaName)
    saName?: SpecializedAreaName;

    @ApiPropertyOptional({ description: 'Area description', example: 'Provides nursing care to older adults' })
    @IsOptional()
    @IsString()
    saDescription?: string;

    @ApiPropertyOptional({ description: 'Contact email', example: 'nursing@hogar.cr', maxLength: 256 })
    @IsOptional()
    @IsEmail()
    @MaxLength(256)
    saContactEmail?: string;

    @ApiPropertyOptional({ description: 'Contact phone', example: '+506 2222-0000', maxLength: 20 })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    saContactPhone?: string;

    @ApiPropertyOptional({ description: 'Whether the area is active', example: true })
    @IsOptional()
    @IsBoolean()
    saIsActive?: boolean;

    @ApiPropertyOptional({ description: 'Manager (user) ID', example: 1 })
    @IsOptional()
    @IsNumber()
    idManager?: number;
}
