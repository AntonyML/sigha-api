import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

/**
 * Payload para añadir una membresía desde el plano de plataforma.
 * El rol debe pertenecer al catálogo de la organización (nunca un rol de
 * plataforma); la validación vive en el servicio.
 */
export class CreatePlatformOrganizationMemberDto {
  @ApiProperty({
    description: 'ID del usuario a añadir a la organización',
    example: 42,
  })
  @IsInt({ message: 'userId debe ser un entero' })
  @IsPositive({ message: 'userId debe ser positivo' })
  userId: number;

  @ApiProperty({
    description: 'ID del rol de organización a asignar (catálogo de roles, nunca plataforma)',
    example: 2,
  })
  @IsInt({ message: 'roleId debe ser un entero' })
  @IsPositive({ message: 'roleId debe ser positivo' })
  roleId: number;
}
