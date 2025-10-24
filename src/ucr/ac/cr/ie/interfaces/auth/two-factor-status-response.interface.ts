export interface TwoFactorStatusResponse {
  enabled: boolean;
  lastUsed: Date | null;
  hasBackupCodes: boolean;
}