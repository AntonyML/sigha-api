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

export class SendAppointmentReminderEmailDto {
  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({ example: 'Odontología' })
  @IsString()
  @IsNotEmpty()
  areaName: string;

  @ApiProperty({ example: 'Don Roberto Castro' })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({ example: 'Sonia Castro' })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({ example: '2026-10-20' })
  @IsString()
  @IsNotEmpty()
  appointmentDate: string;

  @ApiProperty({ example: '10:00 AM' })
  @IsString()
  @IsNotEmpty()
  appointmentTime: string;

  @ApiProperty({ example: 'Dra. María Vargas' })
  @IsString()
  @IsNotEmpty()
  staffName: string;

  @ApiProperty({ example: 'Ayuno requerido', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SendResidentMedicalAlertEmailDto {
  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({ example: 'Don Roberto Castro' })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({ example: 'Sonia Castro' })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({ example: 'Fiebre persistente' })
  @IsString()
  @IsNotEmpty()
  incidentType: string;

  @ApiProperty({ example: '2026-10-14 14:00' })
  @IsString()
  @IsNotEmpty()
  incidentDate: string;

  @ApiProperty({ example: 'Temperatura de 38.5 C observada en control de rutina' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Suministro de antipirético prescrito y monitoreo continuo' })
  @IsString()
  @IsNotEmpty()
  actionTaken: string;

  @ApiProperty({ example: '+506 2222-3333' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;
}

export class SendResidentLeaveEntryEmailDto {
  @ApiProperty({ type: ContactDto })
  @IsObject()
  contact: ContactDto;

  @ApiProperty({ example: 'Salida' })
  @IsString()
  @IsNotEmpty()
  movementType: string;

  @ApiProperty({ example: 'Don Roberto Castro' })
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @ApiProperty({ example: 'Sonia Castro' })
  @IsString()
  @IsNotEmpty()
  familiarName: string;

  @ApiProperty({ example: '2026-10-14 15:30' })
  @IsString()
  @IsNotEmpty()
  movementDateTime: string;

  @ApiProperty({ example: 'Trabajadora Social Pérez' })
  @IsString()
  @IsNotEmpty()
  authorizedBy: string;

  @ApiProperty({ example: 'Cita odontológica externa' })
  @IsString()
  @IsNotEmpty()
  destinationOrReason: string;

  @ApiProperty({ example: '2026-10-14 18:00', required: false })
  @IsString()
  @IsOptional()
  expectedReturn?: string;
}
