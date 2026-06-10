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
