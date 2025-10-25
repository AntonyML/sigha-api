import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers, TimeConstants } from '../../utils/auth-test-utils';

/**
 * PRUEBAS DE INTEGRACIÓN - MÓDULO DE AUTENTICACIÓN
 *
 * Enfoque: Pruebas que verifican la interacción entre diferentes módulos
 * y componentes del sistema.
 *
 * Estrategias de Pruebas:
 * - Integration Testing
 * - Component Integration Testing
 * - System Integration Testing
 * - End-to-End Integration Testing
 */

test.describe('AUTH MODULE - INTEGRATION TESTING', () => {
    let authUtils: AuthAPITestUtils;

    test.beforeEach(async ({ playwright }) => {
        const request = await playwright.request.newContext();
        authUtils = new AuthAPITestUtils(request);
    });

    test.afterEach(async ({ playwright }) => {
        await playwright.request.newContext().dispose();
    });

    // ===== DATABASE INTEGRATION =====
    test.describe('Database Integration', () => {
        test('TC_INT_AUTH_001: Login debe persistir sesión en base de datos', async () => {
            // Arrange: Login exitoso
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();

            if (!data.requiresTwoFactor) {
                // Act: Verificar que la sesión existe en BD
                const sessionCheck = await authUtils.checkSessionInDB(data.accessToken);

                // Assert
                expect(sessionCheck).toBe(true);
            }
        });

        test('TC_INT_AUTH_002: Logout debe remover sesión de base de datos', async () => {
            // Arrange: Login y obtener token
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Logout
                await authUtils.logout(loginData.accessToken);

                // Assert: Verificar que la sesión fue removida
                const sessionCheck = await authUtils.checkSessionInDB(loginData.accessToken);
                expect(sessionCheck).toBe(false);
            }
        });

        test('TC_INT_AUTH_003: Usuario debe ser actualizado en BD después de login', async () => {
            // Arrange: Login exitoso
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();

            if (!data.requiresTwoFactor) {
                // Act: Verificar actualización de lastLoginAt
                const userUpdate = await authUtils.checkUserLastLoginUpdate(TestUsers.SUPER_ADMIN.email);

                // Assert
                expect(userUpdate).toBe(true);
            }
        });
    });

    // ===== JWT SERVICE INTEGRATION =====
    test.describe('JWT Service Integration', () => {
        test('TC_INT_AUTH_004: JWT debe ser válido para endpoints protegidos', async () => {
            // Arrange: Login y obtener token
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Usar token en endpoint protegido
                const profileResponse = await authUtils.getProfile(loginData.accessToken);

                // Assert
                expect(profileResponse.status()).toBe(200);
                const profileData = await profileResponse.json();
                expect(profileData.email).toBe(TestUsers.SUPER_ADMIN.email);
            }
        });

        test('TC_INT_AUTH_005: Refresh token debe generar nuevos tokens', async () => {
            // Arrange: Login y obtener tokens
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Usar refresh token
                const refreshResponse = await authUtils.refreshToken(loginData.refreshToken);

                // Assert
                expect(refreshResponse.status()).toBe(200);
                const refreshData = await refreshResponse.json();
                expect(refreshData.accessToken).toBeDefined();
                expect(refreshData.refreshToken).toBeDefined();

                // Verificar que el nuevo token funcione
                const profileResponse = await authUtils.getProfile(refreshData.accessToken);
                expect(profileResponse.status()).toBe(200);
            }
        });

        test('TC_INT_AUTH_006: Token expirado debe ser rechazado por guards', async () => {
            // Arrange: Crear token expirado manualmente
            const expiredToken = authUtils.generateExpiredToken();

            // Act: Intentar usar token expirado
            const profileResponse = await authUtils.getProfile(expiredToken);

            // Assert
            expect(profileResponse.status()).toBe(401);
        });
    });

    // ===== 2FA SERVICE INTEGRATION =====
    test.describe('2FA Service Integration', () => {
        let tempToken: string;
        let secret: string;

        test.beforeAll(async () => {
            // Setup: Obtener tempToken y secret
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();
            if (data.requiresTwoFactor) {
                tempToken = data.tempToken;

                const setupResponse = await authUtils.setup2FA(data.tempToken);
                if (setupResponse.status() === 200) {
                    const setupData = await setupResponse.json();
                    secret = setupData.secret;
                }
            }
        });

        test('TC_INT_AUTH_007: 2FA setup debe integrar con QR generation', async () => {
            test.skip(!tempToken, 'Requiere tempToken');

            // Act: Setup 2FA
            const response = await authUtils.setup2FA(tempToken);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.secret).toBeDefined();
            expect(data.qrCode).toBeDefined();
            expect(data.backupCodes).toBeDefined();
            expect(data.backupCodes).toHaveLength(10); // 10 códigos de respaldo
        });

        test('TC_INT_AUTH_008: 2FA verification debe integrar con TOTP validation', async () => {
            test.skip(!tempToken || !secret, 'Requiere setup de 2FA');

            // Arrange: Generar código TOTP válido
            const validCode = authUtils.generateValidTOTP(secret);

            // Act: Completar login con 2FA
            const response = await authUtils.completeTwoFactorLogin(tempToken, validCode);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.accessToken).toBeDefined();
            expect(data.refreshToken).toBeDefined();
        });

        test('TC_INT_AUTH_009: Backup codes deben ser persistidos en BD', async () => {
            test.skip(!tempToken, 'Requiere tempToken');

            // Arrange: Setup 2FA
            const setupResponse = await authUtils.setup2FA(tempToken);
            const setupData = await setupResponse.json();
            const backupCodes = setupData.backupCodes;

            // Act: Usar un código de respaldo
            const backupResponse = await authUtils.completeTwoFactorLogin(tempToken, backupCodes[0]);

            // Assert
            expect(backupResponse.status()).toBe(200);

            // Verificar que el código fue marcado como usado en BD
            const usedCheck = await authUtils.checkBackupCodeUsed(backupCodes[0]);
            expect(usedCheck).toBe(true);
        });
    });

    // ===== ROLE-BASED ACCESS CONTROL INTEGRATION =====
    test.describe('RBAC Integration', () => {
        test('TC_INT_AUTH_010: Roles guard debe validar permisos correctamente', async () => {
            // Arrange: Login como super admin
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Intentar acceder a endpoint de admin
                const adminResponse = await authUtils.accessAdminEndpoint(loginData.accessToken);

                // Assert
                expect(adminResponse.status()).toBe(200);
            }
        });

        test('TC_INT_AUTH_011: Usuario sin permisos debe ser rechazado', async () => {
            // Arrange: Login como usuario normal
            const loginResponse = await authUtils.login(
                TestUsers.USER.email,
                TestUsers.USER.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Intentar acceder a endpoint de admin
                const adminResponse = await authUtils.accessAdminEndpoint(loginData.accessToken);

                // Assert
                expect(adminResponse.status()).toBe(403);
            }
        });

        test('TC_INT_AUTH_012: Role changes deben ser auditados', async () => {
            // Arrange: Login como admin
            const loginResponse = await authUtils.login(
                TestUsers.ADMIN.email,
                TestUsers.ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Cambiar rol de un usuario
                const roleChangeResponse = await authUtils.changeUserRole(
                    loginData.accessToken,
                    TestUsers.USER.id,
                    2 // Nuevo rol ID
                );

                // Assert
                expect(roleChangeResponse.status()).toBe(200);

                // Verificar que el cambio fue auditado
                const auditCheck = await authUtils.checkRoleChangeAudit(TestUsers.USER.id);
                expect(auditCheck).toBe(true);
            }
        });
    });

    // ===== AUDIT LOG INTEGRATION =====
    test.describe('Audit Log Integration', () => {
        test('TC_INT_AUTH_013: Login exitoso debe ser auditado', async () => {
            // Arrange: Login exitoso
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const data = await response.json();

            if (!data.requiresTwoFactor) {
                // Act: Verificar auditoría
                const auditCheck = await authUtils.checkLoginAudit(TestUsers.SUPER_ADMIN.email);

                // Assert
                expect(auditCheck).toBe(true);
            }
        });

        test('TC_INT_AUTH_014: Login fallido debe ser auditado', async () => {
            // Arrange: Login fallido
            await authUtils.login(TestUsers.SUPER_ADMIN.email, 'wrongpassword');

            // Act: Verificar auditoría de login fallido
            const auditCheck = await authUtils.checkFailedLoginAudit(TestUsers.SUPER_ADMIN.email);

            // Assert
            expect(auditCheck).toBe(true);
        });

        test('TC_INT_AUTH_015: 2FA verification debe ser auditada', async () => {
            test.skip(!tempToken || !secret, 'Requiere setup de 2FA');

            // Arrange: Verificación 2FA exitosa
            const validCode = authUtils.generateValidTOTP(secret);
            await authUtils.completeTwoFactorLogin(tempToken, validCode);

            // Act: Verificar auditoría
            const auditCheck = await authUtils.check2FAAudit(TestUsers.SUPER_ADMIN.email);

            // Assert
            expect(auditCheck).toBe(true);
        });
    });

    // ===== CACHE INTEGRATION =====
    test.describe('Cache Integration', () => {
        test('TC_INT_AUTH_016: User profile debe ser cacheado después de login', async () => {
            // Arrange: Login exitoso
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Verificar que el perfil está cacheado
                const cacheCheck = await authUtils.checkUserProfileCache(TestUsers.SUPER_ADMIN.id);

                // Assert
                expect(cacheCheck).toBe(true);
            }
        });

        test('TC_INT_AUTH_017: Logout debe limpiar cache de usuario', async () => {
            // Arrange: Login y logout
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                await authUtils.logout(loginData.accessToken);

                // Act: Verificar que el cache fue limpiado
                const cacheCheck = await authUtils.checkUserProfileCache(TestUsers.SUPER_ADMIN.id);

                // Assert
                expect(cacheCheck).toBe(false);
            }
        });
    });

    // ===== EMAIL SERVICE INTEGRATION =====
    test.describe('Email Service Integration', () => {
        test('TC_INT_AUTH_018: Reset password debe enviar email', async () => {
            // Act: Solicitar reset de password
            const response = await authUtils.requestPasswordReset(TestUsers.SUPER_ADMIN.email);

            // Assert
            expect(response.status()).toBe(200);

            // Verificar que el email fue enviado (simulado en tests)
            const emailCheck = await authUtils.checkPasswordResetEmailSent(TestUsers.SUPER_ADMIN.email);
            expect(emailCheck).toBe(true);
        });

        test('TC_INT_AUTH_019: 2FA setup debe enviar email de confirmación', async () => {
            test.skip(!tempToken, 'Requiere tempToken');

            // Act: Setup 2FA
            await authUtils.setup2FA(tempToken);

            // Assert: Verificar email de confirmación
            const emailCheck = await authUtils.check2FAConfirmationEmail(TestUsers.SUPER_ADMIN.email);
            expect(emailCheck).toBe(true);
        });
    });

    // ===== CONCURRENCY INTEGRATION =====
    test.describe('Concurrency Integration', () => {
        test('TC_INT_AUTH_020: Múltiples logins simultáneos deben ser manejados', async () => {
            // Arrange: Múltiples logins simultáneos
            const promises = Array(5).fill(null).map(() =>
                authUtils.login(TestUsers.SUPER_ADMIN.email, TestUsers.SUPER_ADMIN.password)
            );

            // Act
            const responses = await Promise.all(promises);

            // Assert: Todos deben ser exitosos o requerir 2FA
            responses.forEach(response => {
                expect([200, 401]).toContain(response.status());
            });
        });

        test('TC_INT_AUTH_021: Race condition en token refresh debe ser manejado', async () => {
            // Arrange: Login inicial
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Múltiples refresh simultáneos
                const refreshPromises = Array(3).fill(null).map(() =>
                    authUtils.refreshToken(loginData.refreshToken)
                );

                const refreshResponses = await Promise.all(refreshPromises);

                // Assert: Al menos uno debe ser exitoso
                const successCount = refreshResponses.filter(r => r.status() === 200).length;
                expect(successCount).toBeGreaterThan(0);
            }
        });
    });
});