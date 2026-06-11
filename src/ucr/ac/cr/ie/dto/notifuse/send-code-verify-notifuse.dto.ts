import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional } from 'class-validator';
import { ContactDto } from './contact.dto';

class NotificationBodyVerifyDto {
  @ApiProperty({ example: 'code_verifiy_email' })
  @IsString()
  id: string;

  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({ type: Object, description: 'Variables del template MJML' })
  @IsObject()
  data: {
    titulo_principal?: string;
    nombre_usuario?: string;
    mensaje_contexto?: string;
    codigo_verificacion?: string;
    tiempo_expiracion?: string;
    ubicacion?: string;
    fecha_hora?: string;
    url_privacidad?: string;
    url_terminos?: string;
    url_soporte?: string;
    [key: string]: any;
  };

  @ApiProperty({ type: Object })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ type: Object })
  @IsOptional()
  email_options?: Record<string, any>;
}

export class SendCodeVerifyEmailDto {
  @ApiProperty({ example: 'proyectoanalisis' })
  @IsString()
  workspace_id: string;

  @ApiProperty({ type: NotificationBodyVerifyDto })
  @IsObject()
  notification: NotificationBodyVerifyDto;
}
