export interface EmailRecipient {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface PasswordResetParams {
  to: EmailRecipient;
  code: string;
  expirationLabel?: string;
}

export interface BackupCodesParams {
  to: EmailRecipient;
  codes: string[];
}

export interface UserRequestParams {
  to: EmailRecipient;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  reason: string;
}

export interface UserRequestConfirmationParams {
  to: EmailRecipient;
}

export interface WelcomeUserParams {
  to: EmailRecipient;
  roleName: string;
  activationUrl: string;
}

export interface EmailVerificationParams {
  to: EmailRecipient;
  code: string;
  expirationLabel?: string;
}

export interface ContactInquiryParams {
  to: EmailRecipient;
  name: string;
  organization: string;
  email: string;
  message: string;
}

export interface ContactInquiryAutoresponderParams {
  to: EmailRecipient;
  name: string;
}

export interface AppointmentReminderParams {
  to: EmailRecipient;
  areaName: string;
  patientName: string;
  recipientName: string;
  appointmentDate: string;
  appointmentTime: string;
  staffName: string;
  notes?: string;
}

export interface ResidentMedicalAlertParams {
  to: EmailRecipient;
  patientName: string;
  contactName: string;
  incidentType: string;
  incidentDate: string;
  description: string;
  actionTaken: string;
  contactPhone: string;
}

export interface ResidentLeaveEntryParams {
  to: EmailRecipient;
  movementType: 'Salida' | 'Entrada' | string;
  patientName: string;
  familiarName: string;
  movementDateTime: string;
  authorizedBy: string;
  destinationOrReason: string;
  expectedReturn?: string;
}
