import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserRequestDto {
  @ApiProperty({ description: 'Nombre completo del solicitante', example: 'Carlos Rodríguez' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  fullName: string;

  @ApiProperty({ description: 'Correo electrónico del solicitante', example: 'carlos@ejemplo.com' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @MaxLength(256)
  email: string;

  @ApiProperty({ description: 'Teléfono del solicitante', example: '+506 8888-1111' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @ApiProperty({
    description: 'Motivo por el cual solicita la creación de una cuenta',
    example: 'Soy enfermero y necesito acceso al sistema para registrar atenciones.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  reason: string;
}