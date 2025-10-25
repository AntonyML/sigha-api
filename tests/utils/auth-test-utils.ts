import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Utilidades para pruebas de API del módulo de autenticación
 */
export class AuthAPITestUtils {
    private request: APIRequestContext;
    private baseURL: string;

    constructor(request: APIRequestContext, baseURL: string = 'http://localhost:3000') {
        this.request = request;
        this.baseURL = baseURL;
    }

    /**
     * Realiza login básico
     */
    async login(email: string, password: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/login`, {
            data: {
                uEmail: email,
                uPassword: password
            }
        });
    }

    /**
     * Realiza login con código 2FA
     */
    async loginWith2FA(email: string, password: string, twoFactorCode: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/login`, {
            data: {
                uEmail: email,
                uPassword: password,
                twoFactorCode
            }
        });
    }

    /**
     * Completa login con 2FA usando token temporal
     */
    async completeTwoFactorLogin(tempToken: string, twoFactorCode: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/verify-2fa`, {
            data: {
                tempToken,
                twoFactorCode
            }
        });
    }

    /**
     * Configura 2FA para un usuario
     */
    async setup2FA(token: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/setup-2fa`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * Habilita 2FA con código de verificación
     */
    async enable2FA(token: string, verificationCode: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/enable-2fa`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                verificationCode
            }
        });
    }

    /**
     * Deshabilita 2FA
     */
    async disable2FA(token: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/disable-2fa`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * Obtiene estado de 2FA
     */
    async get2FAStatus(token: string): Promise<APIResponse> {
        return await this.request.get(`${this.baseURL}/auth/2fa/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * Obtiene perfil del usuario
     */
    async getProfile(token: string): Promise<APIResponse> {
        return await this.request.get(`${this.baseURL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * Realiza logout
     */
    async logout(token: string): Promise<APIResponse> {
        return await this.request.post(`${this.baseURL}/auth/logout`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    /**
     * Genera código TOTP válido usando speakeasy
     * NOTA: Esta es una función de caja blanca que requiere conocimiento interno
     */
    generateValidTOTP(secret: string): string {
        const speakeasy = require('speakeasy');
        return speakeasy.totp({
            secret: secret,
            encoding: 'base32',
            // Usar tiempo del servidor para verificar sincronización
            time: Math.floor(Date.now() / 1000)
        });
    }

    /**
     * Genera código TOTP con tiempo offset (para pruebas de sincronización)
     */
    generateTOTPWithOffset(secret: string, timeOffsetSeconds: number): string {
        const speakeasy = require('speakeasy');
        const currentTime = Math.floor(Date.now() / 1000);
        return speakeasy.totp({
            secret: secret,
            encoding: 'base32',
            time: currentTime + timeOffsetSeconds
        });
    }

    /**
     * Verifica si un código de respaldo es válido
     */
    isValidBackupCode(code: string, backupCodes: string[]): boolean {
        return backupCodes.includes(code);
    }

    /**
     * Espera helper para operaciones asíncronas
     */
    async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Datos de prueba para usuarios
 */
export const TestUsers = {
    SUPER_ADMIN: {
        email: 'superadmin@hogarancianos.com',
        password: 'SuperAdmin123!',
        name: 'Super Admin',
        role: 'superadmin'
    },
    ADMIN: {
        email: 'admin@hogarancianos.com',
        password: 'Admin123!',
        name: 'Admin User',
        role: 'admin'
    },
    USER: {
        email: 'user@hogarancianos.com',
        password: 'User123!',
        name: 'Regular User',
        role: 'user'
    }
};

/**
 * Constantes de tiempo para pruebas
 */
export const TimeConstants = {
    TOKEN_EXPIRY_5_MIN: 5 * 60 * 1000, // 5 minutos en ms
    TOKEN_EXPIRY_1_HOUR: 60 * 60 * 1000, // 1 hora en ms
    TOTP_TIME_WINDOW: 30, // 30 segundos ventana TOTP
    TEST_TIMEOUT: 30000 // 30 segundos timeout de prueba
};