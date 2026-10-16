import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsObject,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SexoBiologico } from '../../domain/core/persona.entity';
import { RolPersonaTipo } from '../../domain/core/persona-rol.entity';

export class DocumentoInputDto {
  @ApiProperty({ description: 'Tipo de documento (cedula, dimex, pasaporte, otro)', example: 'cedula' })
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @ApiProperty({ description: 'Número de documento', example: '1-0234-0567' })
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @ApiPropertyOptional({ description: 'Fecha de vencimiento' })
  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}

export class ContactoInputDto {
  @ApiProperty({ description: 'Tipo de contacto (telefono_movil, email, whatsapp, otro)', example: 'telefono_movil' })
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @ApiProperty({ description: 'Valor del medio de contacto', example: '8888-9999' })
  @IsString()
  @IsNotEmpty()
  valor!: string;

  @ApiPropertyOptional({ description: 'Es contacto principal', default: true })
  @IsOptional()
  esPrincipal?: boolean = true;
}

export class DireccionInputDto {
  @ApiPropertyOptional({ description: 'Provincia', example: 'San José' })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiPropertyOptional({ description: 'Cantón', example: 'Central' })
  @IsOptional()
  @IsString()
  canton?: string;

  @ApiPropertyOptional({ description: 'Distrito', example: 'Catedral' })
  @IsOptional()
  @IsString()
  distrito?: string;

  @ApiProperty({ description: 'Dirección exacta', example: '200 metros norte de la iglesia' })
  @IsString()
  @IsNotEmpty()
  direccionExacta!: string;
}

export class CrearPersonaDto {
  @ApiProperty({ description: 'Nombre de pila', example: 'Ana' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ description: 'Primer apellido', example: 'Rojas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  primerApellido!: string;

  @ApiPropertyOptional({ description: 'Segundo apellido', example: 'Castro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  segundoApellido?: string;

  @ApiPropertyOptional({ description: 'Fecha de nacimiento (YYYY-MM-DD)', example: '1948-06-20' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({ enum: SexoBiologico, default: SexoBiologico.NO_ESPECIFICADO })
  @IsOptional()
  @IsEnum(SexoBiologico)
  sexo?: SexoBiologico = SexoBiologico.NO_ESPECIFICADO;

  @ApiPropertyOptional({ description: 'Género autopercibido', example: 'Femenino' })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiPropertyOptional({ description: 'Estado civil', example: 'viudo' })
  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @ApiPropertyOptional({ description: 'Nacionalidad', default: 'Costarricense' })
  @IsOptional()
  @IsString()
  nacionalidad?: string = 'Costarricense';

  @ApiPropertyOptional({ description: 'URL de fotografía' })
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiPropertyOptional({ enum: RolPersonaTipo, default: RolPersonaTipo.RESIDENTE })
  @IsOptional()
  @IsEnum(RolPersonaTipo)
  rol?: RolPersonaTipo = RolPersonaTipo.RESIDENTE;

  @ApiPropertyOptional({ type: DocumentoInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentoInputDto)
  documento?: DocumentoInputDto;

  @ApiPropertyOptional({ type: ContactoInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoInputDto)
  contacto?: ContactoInputDto;

  @ApiPropertyOptional({ type: DireccionInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DireccionInputDto)
  direccion?: DireccionInputDto;

  @ApiPropertyOptional({ description: 'Campos dinámicos del expediente (JSONB)', example: { escolaridad: 'Primaria completa', grupo_sanguineo: 'O+' } })
  @IsOptional()
  @IsObject()
  perfilDigital?: Record<string, any>;
}
