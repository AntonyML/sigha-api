import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards';
import { EmailService } from '../../services/email';
import {
  SendBackupCodesEmailDto,
  SendPasswordResetEmailDto,
  SendAppointmentReminderEmailDto,
  SendResidentMedicalAlertEmailDto,
  SendResidentLeaveEntryEmailDto,
} from '../../dto/email';

@ApiTags('Email')
@ApiBearerAuth('jwt')
@Controller('email')
@UseGuards(JwtAuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email de recuperación de contraseña',
    description: 'Envía un email con un código de 8 dígitos para que el usuario pueda restablecer su contraseña.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendPasswordReset(@Body() dto: SendPasswordResetEmailDto) {
    return this.emailService.sendPasswordReset({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      code: dto.code,
      expirationLabel: dto.expirationLabel,
    });
  }

  @Post('backup-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar email con códigos de respaldo 2FA',
    description: 'Envía un email con los 8 códigos de respaldo que el usuario puede usar si pierde acceso a su app TOTP.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendBackupCodes(@Body() dto: SendBackupCodesEmailDto) {
    return this.emailService.sendBackupCodes({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      codes: dto.codes,
    });
  }

  @Post('appointment-reminder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar recordatorio de cita médica a familiar',
    description: 'Notifica a un familiar responsable sobre una cita médica programada para un residente.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendAppointmentReminder(@Body() dto: SendAppointmentReminderEmailDto) {
    return this.emailService.sendAppointmentReminder({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      areaName: dto.areaName,
      patientName: dto.patientName,
      recipientName: dto.recipientName,
      appointmentDate: dto.appointmentDate,
      appointmentTime: dto.appointmentTime,
      staffName: dto.staffName,
      notes: dto.notes,
    });
  }

  @Post('resident-medical-alert')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar alerta médica urgente de residente',
    description: 'Notifica a los contactos de emergencia sobre una eventualidad médica de urgencia.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendResidentMedicalAlert(@Body() dto: SendResidentMedicalAlertEmailDto) {
    return this.emailService.sendResidentMedicalAlert({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      patientName: dto.patientName,
      contactName: dto.contactName,
      incidentType: dto.incidentType,
      incidentDate: dto.incidentDate,
      description: dto.description,
      actionTaken: dto.actionTaken,
      contactPhone: dto.contactPhone,
    });
  }

  @Post('resident-leave-entry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar constancia de entrada/salida de residente',
    description: 'Envía un comprobante digital al familiar sobre el registro de movimiento físico del residente.',
  })
  @ApiResponse({ status: 200, description: 'Email enviado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sendResidentLeaveEntry(@Body() dto: SendResidentLeaveEntryEmailDto) {
    return this.emailService.sendResidentLeaveEntry({
      to: {
        email: dto.contact.email,
        firstName: dto.contact.firstName,
        lastName: dto.contact.lastName,
      },
      movementType: dto.movementType,
      patientName: dto.patientName,
      familiarName: dto.familiarName,
      movementDateTime: dto.movementDateTime,
      authorizedBy: dto.authorizedBy,
      destinationOrReason: dto.destinationOrReason,
      expectedReturn: dto.expectedReturn,
    });
  }
}
