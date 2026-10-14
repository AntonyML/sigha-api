import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ActiveOrganizationDto {
  @ApiProperty({
    description: 'ID de la organización a seleccionar como activa',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID de la organización es obligatorio' })
  @Type(() => Number)
  @IsInt({ message: 'El ID de la organización debe ser un número entero' })
  organizationId: number;
}
