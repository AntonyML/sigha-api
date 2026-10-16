import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  IsBoolean,
  IsUUID,
  IsInt,
} from 'class-validator';
import {
  BitacoraCategoria,
  BitacoraVisibilidad,
  BitacoraUrgencia,
  BitacoraEstado,
} from '../../domain/bitacora/bitacora.enums';

export class AdjuntoBitacoraDto {
  @ApiProperty({ description: 'URL del archivo adjunto' })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiProperty({ description: 'Nombre del archivo adjunto' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Tamaño en bytes' })
  @IsOptional()
  @IsInt()
  size?: number;

  @ApiPropertyOptional({ description: 'Tipo MIME' })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CrearBitacoraEntradaDto {
  @ApiPropertyOptional({ description: 'ID del perfil o residente (UUID)', example: '018f0000-0000-7000-8000-000000000001' })
  @IsOptional()
  perfilId?: string;

  @ApiPropertyOptional({ description: 'ID legacy del adulto mayor (numérico)', example: 1 })
  @IsOptional()
  olderAdultId?: number;

  @ApiPropertyOptional({ description: 'ID de la entrada padre para hilos de conversación' })
  @IsOptional()
  padreId?: number;

  @ApiPropertyOptional({ description: 'Título de la nota' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @ApiProperty({ description: 'Contenido detallado de la entrada de bitácora' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  contenido!: string;

  @ApiPropertyOptional({ enum: BitacoraCategoria, default: BitacoraCategoria.GENERAL })
  @IsOptional()
  @IsEnum(BitacoraCategoria)
  categoria?: BitacoraCategoria = BitacoraCategoria.GENERAL;

  @ApiPropertyOptional({ enum: BitacoraVisibilidad, default: BitacoraVisibilidad.GENERAL })
  @IsOptional()
  @IsEnum(BitacoraVisibilidad)
  visibilidad?: BitacoraVisibilidad = BitacoraVisibilidad.GENERAL;

  @ApiPropertyOptional({ enum: BitacoraUrgencia, default: BitacoraUrgencia.BAJA })
  @IsOptional()
  @IsEnum(BitacoraUrgencia)
  urgencia?: BitacoraUrgencia = BitacoraUrgencia.BAJA;

  @ApiPropertyOptional({ enum: BitacoraEstado, default: BitacoraEstado.PUBLICADO })
  @IsOptional()
  @IsEnum(BitacoraEstado)
  estado?: BitacoraEstado = BitacoraEstado.PUBLICADO;

  @ApiPropertyOptional({ description: 'Indica si se requiere acuse de recibo de lectura' })
  @IsOptional()
  @IsBoolean()
  requiereAcuse?: boolean = false;

  @ApiPropertyOptional({ type: [AdjuntoBitacoraDto] })
  @IsOptional()
  @IsArray()
  adjuntos?: AdjuntoBitacoraDto[] = [];
}
