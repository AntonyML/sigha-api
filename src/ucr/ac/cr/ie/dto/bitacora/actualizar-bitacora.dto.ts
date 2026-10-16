import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BitacoraEstado } from '../../domain/bitacora/bitacora.enums';

export class ActualizarEstadoBitacoraDto {
  @ApiProperty({ enum: BitacoraEstado, description: 'Nuevo estado de la entrada' })
  @IsEnum(BitacoraEstado)
  @IsNotEmpty()
  estado!: BitacoraEstado;

  @ApiPropertyOptional({ description: 'Comentario opcional sobre el cambio de estado' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}

export class RegistrarAcuseBitacoraDto {
  @ApiPropertyOptional({ description: 'Comentario o nota de recepción' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  comentario?: string;
}
