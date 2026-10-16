import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PlanTier } from '../../../domain/organizations';

/**
 * Payload for creating an organization from the SaaS platform plane.
 * Only platform roles (validated by `PlatformGuard` + `PlatformStepUpGuard`)
 * may call the endpoint that consumes this DTO.
 */
export class CreatePlatformOrganizationDto {
  @ApiProperty({
    description: 'Nombre visible de la organización',
    example: 'Hogar San Pedro',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description:
      'Slug URL-safe único. Si se omite, se deriva del nombre y se desambigua automáticamente.',
    example: 'hogar-san-pedro',
  })
  @IsOptional()
  @IsString({ message: 'El slug debe ser una cadena de texto' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo admite minúsculas, números y guiones simples',
  })
  @MaxLength(80, { message: 'El slug no puede exceder 80 caracteres' })
  slug?: string;

  @ApiPropertyOptional({
    enum: PlanTier,
    description: 'Plan comercial inicial (BASIC por defecto)',
  })
  @IsOptional()
  @IsEnum(PlanTier, { message: 'El plan no es válido' })
  planTier?: PlanTier;
}
