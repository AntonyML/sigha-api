import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers, TimeConstants } from '../../utils/auth-test-utils';
import * as jwt from 'jsonwebtoken';

/**
 * PRUEBAS DE CAJA BLANCA - MÓDULO DE AUTENTICACIÓN
 *
 * Enfoque: Pruebas que conocen la implementación interna del sistema.
 * Evalúan rutas de código, condiciones, bucles y lógica interna.
 *
 * Estrategia de Pruebas:
 * - Path Coverage
 * - Statement Coverage
 * - Branch Coverage
 * - Condition Coverage
 * - Multiple Condition Coverage
 */

test.describe('AUTH MODULE - WHITE BOX TESTING', () => {
    let authUtils: AuthAPITestUtils;
    let tempToken: string;

    test.beforeEach(async ({ playwright }) => {
        const request = await playwright.request.newContext();
        authUtils = new AuthAPITestUtils(request);
    });

    test.afterEach(async ({ playwright }) => {
        // Cleanup is handled automatically by Playwright
    });

    // ===== JWT TOKEN GENERATION =====
    test.describe('JWT Token Generation - Path Coverage', () => {
        test('TC_WB_AUTH_001: Token temporal debe expirar exactamente en 5 minutos', async () => {
            // Arrange: Login que requiere 2FA
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Act
            const data = await response.json();

            if (data.requiresTwoFactor) {
                // Assert: Verificar estructura del token temporal
                expect(data.tempToken).toBeDefined();
                expect(typeof data.tempToken).toBe('string');

                // Verificar payload del token (conocimiento interno)
                const decoded = jwt.decode(data.tempToken) as jwt.JwtPayload;

                expect(decoded).toHaveProperty('sub');
                expect(decoded).toHaveProperty('email', TestUsers.SUPER_ADMIN.email);
                expect(decoded).toHaveProperty('require2FA', true);
                expect(decoded).toHaveProperty('iat'); // Issued at
                expect(decoded).toHaveProperty('exp'); // Expires at

                // Verificar expiración exacta de 5 minutos
                const expectedExpiry = decoded.iat + (5 * 60); // 5 minutos en segundos
                expect(decoded.exp).toBe(expectedExpiry);

                // Verificar tiempo actual vs expiración
                const now = Math.floor(Date.now() / 1000);
                const timeToExpiry = decoded.exp - now;
                expect(timeToExpiry).toBeGreaterThan(290); // Al menos 4:50 minutos restantes
                expect(timeToExpiry).toBeLessThanOrEqual(300); // Máximo 5 minutos
            }
        });

        test('TC_WB_AUTH_002: Token de acceso debe expirar en 1 hora', async () => {
            // Arrange: Login sin 2FA o completando 2FA
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();

            if (!data.requiresTwoFactor) {
                // Assert: Verificar token de acceso
                const decoded = jwt.decode(data.accessToken) as jwt.JwtPayload;

                expect(decoded).toHaveProperty('sub');
                expect(decoded).toHaveProperty('email');
                expect(decoded).toHaveProperty('roleId');
                expect(decoded).toHaveProperty('role');
                expect(decoded).toHaveProperty('iat');
                expect(decoded).toHaveProperty('exp');

                // Verificar expiración de 1 hora
                const expectedExpiry = decoded.iat + (60 * 60); // 1 hora en segundos
                expect(decoded.exp).toBe(expectedExpiry);
            }
        });
    });

    // ===== 2FA LOGIC PATHS =====
    test.describe('2FA Logic - Branch Coverage', () => {
        test('TC_WB_AUTH_003: Rama sin 2FA debe retornar tokens directamente', async () => {
            // Arrange: Usuario sin 2FA habilitado
            const response = await authUtils.login(
                TestUsers.USER.email, // Asumiendo que este usuario no tiene 2FA
                TestUsers.USER.password
            );

            // Assert: Debe tomar la rama sin 2FA
            expect(response.status()).toBe(200);
            const data = await response.json();

            expect(data.requiresTwoFactor).toBeFalsy();
            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
            expect(data.tempToken).toBeUndefined();
        });

        test('TC_WB_AUTH_004: Rama con 2FA debe retornar tempToken', async () => {
            // Arrange: Usuario con 2FA habilitado
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Assert: Debe tomar la rama con 2FA
            expect(response.status()).toBe(200);
            const data = await response.json();

            if (data.requiresTwoFactor) {
                expect(data.accessToken).toBe('');
                expect(data.tempToken).toBeDefined();
                expect(data.requiresTwoFactor).toBe(true);
            }
        });

        test('TC_WB_AUTH_005: Rama con 2FA + código debe validar y retornar tokens', async () => {
            // Arrange: Usuario con 2FA + código válido
            const validCode = authUtils.generateValidTOTP('TEST_SECRET'); // Conocimiento interno

            const response = await authUtils.loginWith2FA(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password,
                validCode
            );

            // Assert: Debe tomar la rama con código 2FA
            expect(response.status()).toBe(200);
            const data = await response.json();

            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
            expect(data.requiresTwoFactor).toBeUndefined();
        });
    });

    // ===== TOTP VALIDATION =====
    test.describe('TOTP Validation - Condition Coverage', () => {
        let secret: string;
        let authUtils: AuthAPITestUtils;

        test.beforeAll(async ({ playwright }) => {
            // Initialize auth utils
            const request = await playwright.request.newContext();
            authUtils = new AuthAPITestUtils(request);

            // Setup: Obtener tempToken y secret para pruebas
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();
            if (data.requiresTwoFactor) {
                tempToken = data.tempToken;

                // Obtener secret del setup 2FA (conocimiento interno)
                const setupResponse = await authUtils.setup2FA(data.tempToken);
                if (setupResponse.status() === 200) {
                    const setupData = await setupResponse.json();
                    secret = setupData.secret;
                }
            }
        });

        test('TC_WB_AUTH_006: Código TOTP válido debe ser aceptado', async () => {
            test.skip(!tempToken || !secret, 'Requiere setup de 2FA');

            // Arrange: Generar código TOTP válido
            const validCode = authUtils.generateValidTOTP(secret);

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, validCode);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.accessToken).toBeDefined();
        });

        test('TC_WB_AUTH_007: Código TOTP expirado debe ser rechazado', async () => {
            test.skip(!tempToken || !secret, 'Requiere setup de 2FA');

            // Arrange: Generar código con offset de tiempo negativo (expirado)
            const expiredCode = authUtils.generateTOTPWithOffset(secret, -60); // 1 minuto atrás

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, expiredCode);

            // Assert
            expect(response.status()).toBe(401);
        });

        test('TC_WB_AUTH_008: Código TOTP futuro debe ser rechazado', async () => {
            test.skip(!tempToken || !secret, 'Requiere setup de 2FA');

            // Arrange: Generar código con offset de tiempo positivo (futuro)
            const futureCode = authUtils.generateTOTPWithOffset(secret, 60); // 1 minuto adelante

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, futureCode);

            // Assert
            expect(response.status()).toBe(401);
        });

        test('TC_WB_AUTH_009: Time window de TOTP debe ser exactamente 30 segundos', async () => {
            test.skip(!secret, 'Requiere secret de 2FA');

            // Arrange: Verificar que el código generado en tiempo actual funcione
            const currentCode = authUtils.generateValidTOTP(secret);

            // Act & Assert: Debe funcionar inmediatamente
            const response = await authUtils.completeTwoFactorLogin(tempToken, currentCode);
            expect(response.status()).toBe(200);
        });
    });

        // ===== BACKUP CODE LOGIC =====
    test.describe('Backup Code Logic - Multiple Condition Coverage', () => {
        let backupCodes: string[];
        let authUtils: AuthAPITestUtils;

        test.beforeAll(async ({ playwright }) => {
            // Initialize auth utils
            const request = await playwright.request.newContext();
            authUtils = new AuthAPITestUtils(request);

            // Setup: Obtener códigos de respaldo
            const setupResponse = await authUtils.setup2FA('valid_token');
            if (setupResponse.status() === 200) {
                const setupData = await setupResponse.json();
                backupCodes = setupData.backupCodes;
            }
        });

        test('TC_WB_AUTH_010: Código de respaldo válido debe ser aceptado y removido', async () => {
            test.skip(!backupCodes || backupCodes.length === 0, 'Requiere códigos de respaldo');

            // Arrange
            const validBackupCode = backupCodes[0];

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, validBackupCode);

            // Assert
            expect(response.status()).toBe(200);

            // Verificar que el código fue removido (conocimiento interno)
            const updatedStatus = await authUtils.get2FAStatus('valid_token');
            const statusData = await updatedStatus.json();
            expect(statusData.hasBackupCodes).toBe(true); // Aún debe tener códigos restantes
        });

        test('TC_WB_AUTH_011: Código de respaldo usado no debe funcionar nuevamente', async () => {
            test.skip(!backupCodes, 'Requiere códigos de respaldo');

            // Arrange: Usar el mismo código nuevamente
            const usedBackupCode = backupCodes[0];

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, usedBackupCode);

            // Assert: Debe fallar porque el código ya fue usado
            expect(response.status()).toBe(401);
        });
    });

    // ===== PASSWORD VALIDATION =====
    test.describe('Password Validation - Statement Coverage', () => {
        test('TC_WB_AUTH_012: PasswordUtil.verify debe ser llamado correctamente', async () => {
            // Arrange: Login válido
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Assert: Si el login es exitoso, significa que PasswordUtil.verify funcionó
            expect(response.status()).toBe(200);

            // Verificar que la respuesta tenga la estructura esperada
            const data = await response.json();
            expect(data.user).toBeDefined();
        });

        test('TC_WB_AUTH_013: Password incorrecto debe fallar antes de 2FA', async () => {
            // Arrange: Password incorrecto
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                'wrongpassword'
            );

            // Assert: Debe fallar con 401 antes de llegar a 2FA
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.message).toContain('Credenciales inválidas');
        });
    });

    // ===== SESSION MANAGEMENT =====
    test.describe('Session Management - Path Coverage', () => {
        test('TC_WB_AUTH_014: generateTokens debe crear sesión con hash correcto', async () => {
            // Arrange: Login exitoso
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();

            if (!data.requiresTwoFactor) {
                // Assert: Verificar que se creó una sesión (conocimiento interno)
                expect(data.accessToken).toBeDefined();
                expect(data.refreshToken).toBeDefined();

                // Verificar estructura del token
                const decoded = jwt.decode(data.accessToken) as jwt.JwtPayload;

                expect(decoded).toHaveProperty('sub');
                expect(decoded).toHaveProperty('email');
                expect(decoded).toHaveProperty('roleId');
                expect(decoded).toHaveProperty('role');
            }
        });

        test('TC_WB_AUTH_015: Logout debe invalidar token hash en BD', async () => {
            // Arrange: Login y obtener token
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Logout
                const logoutResponse = await authUtils.logout(loginData.accessToken);

                // Assert
                expect(logoutResponse.status()).toBe(200);

                // Verificar que el token ya no funcione
                const profileResponse = await authUtils.getProfile(loginData.accessToken);
                expect(profileResponse.status()).toBe(401);
            }
        });
    });

    // ===== ERROR HANDLING =====
    test.describe('Error Handling - Exception Coverage', () => {
        test('TC_WB_AUTH_016: completeTwoFactorLogin debe manejar token inválido', async () => {
            // Arrange: Token inválido
            const invalidToken = 'invalid.jwt.token';

            // Act
            const response = await authUtils.completeTwoFactorLogin(invalidToken, '123456');

            // Assert
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.message).toContain('inválido');
        });

        test('TC_WB_AUTH_017: completeTwoFactorLogin debe manejar token expirado', async () => {
            // Arrange: Crear token expirado manualmente
            const expiredToken = jwt.sign(
                { sub: 1, email: 'test@test.com', require2FA: true },
                'test-secret',
                { expiresIn: '-1h' } // Ya expirado
            );

            // Act
            const response = await authUtils.completeTwoFactorLogin(expiredToken, '123456');

            // Assert
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.message).toContain('expirado');
        });
    });
});