import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TipoCampoDinamico } from '../../domain/core/definicion-campo.entity';

export class CrearSeccionCampoDto {
  @ApiProperty({ description: 'ID de la plantilla' })
  @IsUUID()
  @IsNotEmpty()
  plantillaId!: string;

  @ApiProperty({ description: 'Clave única de la sección', example: 'datos_clinicos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  clave!: string;

  @ApiProperty({ description: 'Título visible de la sección', example: 'Datos Clínicos y Alergias' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo!: string;

  @ApiPropertyOptional({ description: 'Descripción explicativa' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Icono de la sección (ej. Heart, User)' })
  @IsOptional()
  @IsString()
  icono?: string;

  @ApiPropertyOptional({ description: 'Orden de visualización', default: 0 })
  @IsOptional()
  @IsInt()
  orden?: number = 0;
}

export class CrearDefinicionCampoDto {
  @ApiProperty({ description: 'ID de la sección donde se ubica el campo' })
  @IsUUID()
  @IsNotEmpty()
  seccionId!: string;

  @ApiProperty({ description: 'Clave en el objeto JSONB', example: 'alergia_penicilina' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  clave!: string;

  @ApiProperty({ description: 'Etiqueta para el formulario', example: '¿Alergia a la Penicilina?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  etiqueta!: string;

  @ApiPropertyOptional({ description: 'Texto de ayuda o descripción' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ enum: TipoCampoDinamico, description: 'Tipo de dato del campo' })
  @IsEnum(TipoCampoDinamico)
  @IsNotEmpty()
  tipo!: TipoCampoDinamico;

  @ApiPropertyOptional({ description: 'Opciones para selección múltiple o simple', example: ['Sí', 'No'] })
  @IsOptional()
  opciones?: any[];

  @ApiPropertyOptional({ description: 'Reglas de validación (JSON Schema o min/max)' })
  @IsOptional()
  validacion?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Valor por defecto' })
  @IsOptional()
  valorDefecto?: any;

  @ApiPropertyOptional({ description: '¿Es obligatorio?', default: false })
  @IsOptional()
  @IsBoolean()
  obligatorio?: boolean = false;

  @ApiPropertyOptional({ description: '¿Es visible en el formulario?', default: true })
  @IsOptional()
  @IsBoolean()
  visible?: boolean = true;

  @ApiPropertyOptional({ description: 'Orden en la sección', default: 0 })
  @IsOptional()
  @IsInt()
  orden?: number = 0;
}
