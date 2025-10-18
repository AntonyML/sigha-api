import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export interface TwoFactorSetup {
    secret: string;
    qrCode: string;
    backupCodes: string[];
}

export class TwoFactorUtil {
    /**
     * Genera un secreto 2FA para un usuario
     */
    static generateSecret(userEmail: string, serviceName: string = 'Hogar de Ancianos'): {
        secret: string;
        otpauthUrl: string;
    } {
        const secret = speakeasy.generateSecret({
            name: userEmail,
            issuer: serviceName,
        });

        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url,
        };
    }

    /**
     * Genera un código QR para la configuración 2FA
     */
    static async generateQRCode(otpauthUrl: string): Promise<string> {
        try {
            return await qrcode.toDataURL(otpauthUrl);
        } catch (error) {
            throw new Error('Error generando código QR');
        }
    }

    /**
     * Verifica un token TOTP
     */
    static verifyToken(token: string, secret: string): boolean {
        console.log('\n=== 2FA TOKEN DEBUG ===');
        console.log('Token received:', token);
        console.log('Secret (first 10 chars):', secret.substring(0, 10) + '...');
        console.log('Current server time:', new Date().toISOString());
        
        // Probar con ventana más amplia para debugging
        const result = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 6, // Aumentado a ±180 segundos para debugging
        });
        
        console.log('Verification result:', result);
        console.log('=== 2FA TOKEN DEBUG END ===\n');
        
        return result;
    }

    /**
     * Genera códigos de respaldo
     */
    static generateBackupCodes(count: number = 10): string[] {
        const codes: string[] = [];

        for (let i = 0; i < count; i++) {
            // Genera códigos de 8 dígitos
            const code = Math.random().toString().slice(2, 10);
            codes.push(code);
        }

        return codes;
    }

    /**
     * Configura 2FA completo para un usuario
     */
    static async setupTwoFactor(userEmail: string): Promise<TwoFactorSetup> {
        const { secret, otpauthUrl } = this.generateSecret(userEmail);
        const qrCode = await this.generateQRCode(otpauthUrl);
        const backupCodes = this.generateBackupCodes();

        return {
            secret,
            qrCode,
            backupCodes,
        };
    }

    /**
     * Verifica si un código es un código de respaldo válido
     */
    static verifyBackupCode(code: string, backupCodes: string[]): boolean {
        return backupCodes.includes(code);
    }

    /**
     * Remueve un código de respaldo usado
     */
    static removeUsedBackupCode(code: string, backupCodes: string[]): string[] {
        return backupCodes.filter(backupCode => backupCode !== code);
    }
}