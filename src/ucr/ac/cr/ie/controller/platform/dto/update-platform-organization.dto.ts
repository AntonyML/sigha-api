import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrganizationStatus, PlanTier } from '../../../domain/organizations';

/**
 * Payload for updating an organization from the SaaS platform plane.
 * Every field is optional; only the provided ones are applied.
 */
export class UpdatePlatformOrganizationDto {
  @ApiPropertyOptional({
    description: 'Nuevo nombre visible de la organización',
    example: 'Hogar San Pedro (renombrado)',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    enum: OrganizationStatus,
    description: 'Estado de ciclo de vida del tenant (ACTIVE/SUSPENDED/ARCHIVED)',
  })
  @IsOptional()
  @IsEnum(OrganizationStatus, { message: 'El estado no es válido' })
  status?: OrganizationStatus;

  @ApiPropertyOptional({
    enum: PlanTier,
    description: 'Plan comercial de la organización',
  })
  @IsOptional()
  @IsEnum(PlanTier, { message: 'El plan no es válido' })
  planTier?: PlanTier;

  @ApiPropertyOptional({
    description: 'Bandera heredada de tenant activo',
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser booleano' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description:
      'Overrides de branding. Solo admite displayName, logoUrl y primaryColor.',
    example: { displayName: 'San Pedro', primaryColor: '#0d6efd' },
  })
  @IsOptional()
  @IsObject({ message: 'brandingOverrides debe ser un objeto' })
  brandingOverrides?: Record<string, unknown>;
}
