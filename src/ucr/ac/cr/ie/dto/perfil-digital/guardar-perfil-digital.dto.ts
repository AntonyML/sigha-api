import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class GuardarPerfilDigitalDto {
  @ApiPropertyOptional({ description: 'ID de la plantilla aplicada (UUID opcional)' })
  @IsOptional()
  @IsUUID()
  plantillaId?: string;

  @ApiProperty({ description: 'Valores clave-valor para los campos del perfil digital', example: { escolaridad: 'Universitaria', alergias_conocidas: 'Penicilina' } })
  @IsObject()
  @IsNotEmpty()
  datos!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadatos adicionales' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
