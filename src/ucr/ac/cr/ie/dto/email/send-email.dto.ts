import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class ContactDto {
  @ApiProperty({ example: 'juan.perez@ejemplo.com' })
  @IsEmail()
  @MaxLength(256)
  email: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Pérez', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;
}

export class SendPasswordResetEmailDto {
  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({ example: '12345678', description: 'Código de 8 dígitos' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: '15 minutos', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  expirationLabel?: string;
}

export class SendBackupCodesEmailDto {
  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({
    type: [String],
    example: ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF', 'GGGG-HHHH', 'IIII-JJJJ', 'KKKK-LLLL', 'MMMM-NNNN', 'OOOO-PPPP'],
    description: '8 códigos de respaldo 2FA',
  })
  @IsString({ each: true })
  codes: string[];
}
