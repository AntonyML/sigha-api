export interface Setup2FAResponse {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}