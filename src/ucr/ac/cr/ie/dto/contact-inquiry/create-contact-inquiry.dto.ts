import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactInquiryDto {
  @ApiProperty({ description: 'Nombre completo de quien realiza la consulta', example: 'Roberto Gómez' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Organización o institución (opcional)', example: 'Universidad de Costa Rica', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  organization?: string;

  @ApiProperty({ description: 'Correo electrónico de contacto', example: 'roberto@ejemplo.com' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @MaxLength(256)
  email: string;

  @ApiProperty({
    description: 'Mensaje o consulta sobre SIGHA',
    example: 'Deseamos solicitar información sobre el proceso de admisión y programas para adultos mayores.',
  })
  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MinLength(5, { message: 'El mensaje debe tener al menos 5 caracteres' })
  @MaxLength(3000)
  message: string;
}
