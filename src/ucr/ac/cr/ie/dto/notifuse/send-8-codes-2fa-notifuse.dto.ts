import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ContactDto } from './contact.dto';

class NotificationBody8CodesDto {
  @ApiProperty({ example: '8_codes_2fa_email' })
  @IsString()
  id: string;

  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({ description: 'Variables del template MJML' })
  @IsObject()
  data: {
    titulo_principal?: string;
    nombre_usuario?: string;
    mensaje_contexto?: string;
    titulo_codigos_respaldo?: string;
    codigo_1?: string;
    codigo_2?: string;
    codigo_3?: string;
    codigo_4?: string;
    codigo_5?: string;
    codigo_6?: string;
    codigo_7?: string;
    codigo_8?: string;
    url_accion?: string;
    texto_boton?: string;
    tiempo_expiracion?: string;
    ubicacion?: string;
    fecha_hora?: string;
    url_privacidad?: string;
    url_terminos?: string;
    url_soporte?: string;
  };

  @ApiProperty({ type: Object })
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ type: Object })
  @IsObject()
  email_options?: Record<string, any>;
}

export class Send8Codes2FADto {
  @ApiProperty({ example: 'proyectoanalisis' })
  @IsString()
  workspace_id: string;

  @ApiProperty({ type: NotificationBody8CodesDto })
  @IsObject()
  notification: NotificationBody8CodesDto;
}
