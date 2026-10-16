import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

/**
 * Payload para cambiar el rol de una membresía desde el plano de plataforma.
 */
export class UpdatePlatformOrganizationMemberDto {
  @ApiProperty({
    description: 'Nuevo rol de organización (catálogo de roles, nunca plataforma)',
    example: 3,
  })
  @IsInt({ message: 'roleId debe ser un entero' })
  @IsPositive({ message: 'roleId debe ser positivo' })
  roleId: number;
}
