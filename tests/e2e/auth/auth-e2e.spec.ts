import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers, TimeConstants } from '../../utils/auth-test-utils';

/**
 * PRUEBAS E2E (END-TO-END) - MÓDULO DE AUTENTICACIÓN
 *
 * Enfoque: Pruebas que simulan el flujo completo del usuario desde
 * el inicio hasta el final del proceso de autenticación.
 *
 * Estrategias de Pruebas:
 * - User Journey Testing
 * - Critical Path Testing
 * - Happy Path Testing
 * - Sad Path Testing
 * - Edge Case Testing
 */

test.describe('AUTH MODULE - END-TO-END TESTING', () => {
    let authUtils: AuthAPITestUtils;

    test.beforeEach(async ({ playwright }) => {
        const request = await playwright.request.newContext();
        authUtils = new AuthAPITestUtils(request);
    });

    test.afterEach(async ({ playwright }) => {
        await playwright.request.newContext().dispose();
    });

    // ===== HAPPY PATH SCENARIOS =====
    test.describe('Happy Path Scenarios', () => {
        test('TC_E2E_AUTH_001: Flujo completo de login sin 2FA', async () => {
            // Arrange: Usuario sin 2FA habilitado

            // Act 1: Login inicial
            const loginResponse = await authUtils.login(
                TestUsers.USER.email,
                TestUsers.USER.password
            );

            // Assert 1: Login exitoso sin requerir 2FA
            expect(loginResponse.status()).toBe(200);
            const loginData = await loginResponse.json();
            expect(loginData.requiresTwoFactor).toBeFalsy();
            expect(loginData.accessToken).toBeDefined();
            expect(loginData.refreshToken).toBeDefined();

            // Act 2: Acceder a perfil con token
            const profileResponse = await authUtils.getProfile(loginData.accessToken);

            // Assert 2: Acceso a perfil exitoso
            expect(profileResponse.status()).toBe(200);
            const profileData = await profileResponse.json();
            expect(profileData.email).toBe(TestUsers.USER.email);

            // Act 3: Refresh token
            const refreshResponse = await authUtils.refreshToken(loginData.refreshToken);

            // Assert 3: Refresh exitoso
            expect(refreshResponse.status()).toBe(200);
            const refreshData = await refreshResponse.json();
            expect(refreshData.accessToken).toBeDefined();

            // Act 4: Logout
            const logoutResponse = await authUtils.logout(loginData.accessToken);

            // Assert 4: Logout exitoso
            expect(logoutResponse.status()).toBe(200);

            // Act 5: Verificar que token ya no funciona
            const finalProfileResponse = await authUtils.getProfile(loginData.accessToken);

            // Assert 5: Token invalidado
            expect(finalProfileResponse.status()).toBe(401);
        });

        test('TC_E2E_AUTH_002: Flujo completo de login con 2FA usando TOTP', async () => {
            // Arrange: Usuario con 2FA habilitado

            // Act 1: Login inicial
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Assert 1: Login requiere 2FA
            expect(loginResponse.status()).toBe(200);
            const loginData = await loginResponse.json();
            expect(loginData.requiresTwoFactor).toBe(true);
            expect(loginData.tempToken).toBeDefined();
            expect(loginData.accessToken).toBe('');

            // Act 2: Setup 2FA (si no está configurado)
            const setupResponse = await authUtils.setup2FA(loginData.tempToken);
            expect(setupResponse.status()).toBe(200);
            const setupData = await setupResponse.json();
            expect(setupData.secret).toBeDefined();
            expect(setupData.qrCode).toBeDefined();
            expect(setupData.backupCodes).toHaveLength(10);

            // Act 3: Generar código TOTP válido
            const validCode = authUtils.generateValidTOTP(setupData.secret);

            // Act 4: Completar login con 2FA
            const twoFactorResponse = await authUtils.completeTwoFactorLogin(
                loginData.tempToken,
                validCode
            );

            // Assert 4: 2FA exitoso
            expect(twoFactorResponse.status()).toBe(200);
            const twoFactorData = await twoFactorResponse.json();
            expect(twoFactorData.accessToken).toBeDefined();
            expect(twoFactorData.refreshToken).toBeDefined();

            // Act 5: Acceder a perfil con token final
            const profileResponse = await authUtils.getProfile(twoFactorData.accessToken);

            // Assert 5: Acceso a perfil exitoso
            expect(profileResponse.status()).toBe(200);
            const profileData = await profileResponse.json();
            expect(profileData.email).toBe(TestUsers.SUPER_ADMIN.email);

            // Act 6: Logout
            const logoutResponse = await authUtils.logout(twoFactorData.accessToken);

            // Assert 6: Logout exitoso
            expect(logoutResponse.status()).toBe(200);
        });

        test('TC_E2E_AUTH_003: Flujo completo de login con backup codes', async () => {
            // Arrange: Usuario con 2FA configurado

            // Act 1: Login inicial
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (loginData.requiresTwoFactor) {
                // Act 2: Obtener códigos de respaldo
                const setupResponse = await authUtils.setup2FA(loginData.tempToken);
                const setupData = await setupResponse.json();
                const backupCodes = setupData.backupCodes;

                // Act 3: Usar código de respaldo
                const backupResponse = await authUtils.completeTwoFactorLogin(
                    loginData.tempToken,
                    backupCodes[0]
                );

                // Assert 3: Login con backup code exitoso
                expect(backupResponse.status()).toBe(200);
                const backupData = await backupResponse.json();
                expect(backupData.accessToken).toBeDefined();

                // Act 4: Verificar que el código fue usado
                const repeatResponse = await authUtils.completeTwoFactorLogin(
                    loginData.tempToken,
                    backupCodes[0]
                );

                // Assert 4: Código ya no funciona
                expect(repeatResponse.status()).toBe(401);
            }
        });
    });

    // ===== SAD PATH SCENARIOS =====
    test.describe('Sad Path Scenarios', () => {
        test('TC_E2E_AUTH_004: Flujo de credenciales inválidas', async () => {
            // Act 1: Intentar login con email incorrecto
            const invalidEmailResponse = await authUtils.login('invalid@email.com', 'password');

            // Assert 1: Login fallido
            expect(invalidEmailResponse.status()).toBe(401);

            // Act 2: Intentar login con password incorrecto
            const invalidPasswordResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                'wrongpassword'
            );

            // Assert 2: Login fallido
            expect(invalidPasswordResponse.status()).toBe(401);

            // Act 3: Verificar que no se creó sesión
            const sessionCheck = await authUtils.checkSessionInDB('nonexistent_token');
            expect(sessionCheck).toBe(false);
        });

        test('TC_E2E_AUTH_005: Flujo de 2FA fallido', async () => {
            // Arrange: Usuario con 2FA
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (loginData.requiresTwoFactor) {
                // Act 1: Intentar código inválido
                const invalidCodeResponse = await authUtils.completeTwoFactorLogin(
                    loginData.tempToken,
                    '000000'
                );

                // Assert 1: 2FA fallido
                expect(invalidCodeResponse.status()).toBe(401);

                // Act 2: Intentar código expirado
                const expiredCode = authUtils.generateTOTPWithOffset('TEST_SECRET', -60);
                const expiredResponse = await authUtils.completeTwoFactorLogin(
                    loginData.tempToken,
                    expiredCode
                );

                // Assert 2: Código expirado rechazado
                expect(expiredResponse.status()).toBe(401);

                // Act 3: Verificar que tempToken sigue siendo válido
                const validCode = authUtils.generateValidTOTP('TEST_SECRET');
                const validResponse = await authUtils.completeTwoFactorLogin(
                    loginData.tempToken,
                    validCode
                );

                // Assert 3: Aún puede completar con código válido
                expect(validResponse.status()).toBe(200);
            }
        });

        test('TC_E2E_AUTH_006: Flujo de token expirado', async () => {
            // Arrange: Login exitoso
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act 1: Esperar a que el token expire (simular)
                const expiredToken = authUtils.generateExpiredToken();

                // Act 2: Intentar usar token expirado
                const expiredResponse = await authUtils.getProfile(expiredToken);

                // Assert 2: Acceso denegado
                expect(expiredResponse.status()).toBe(401);

                // Act 3: Intentar refresh con token expirado
                const refreshResponse = await authUtils.refreshToken(loginData.refreshToken);

                // Assert 3: Refresh exitoso (refresh token aún válido)
                expect(refreshResponse.status()).toBe(200);
            }
        });
    });

    // ===== EDGE CASE SCENARIOS =====
    test.describe('Edge Case Scenarios', () => {
        test('TC_E2E_AUTH_007: Flujo de concurrencia - múltiples logins simultáneos', async () => {
            // Act: Múltiples logins simultáneos del mismo usuario
            const loginPromises = Array(10).fill(null).map(() =>
                authUtils.login(TestUsers.SUPER_ADMIN.email, TestUsers.SUPER_ADMIN.password)
            );

            const responses = await Promise.all(loginPromises);

            // Assert: Sistema maneja la concurrencia
            const successCount = responses.filter(r => r.status() === 200).length;
            const twoFactorCount = responses.filter(r => {
                const data = r.json();
                return data.requiresTwoFactor === true;
            }).length;

            expect(successCount + twoFactorCount).toBe(10); // Todos los requests manejados
        });

        test('TC_E2E_AUTH_008: Flujo de recuperación de password', async () => {
            // Act 1: Solicitar reset de password
            const resetRequestResponse = await authUtils.requestPasswordReset(
                TestUsers.SUPER_ADMIN.email
            );

            // Assert 1: Solicitud exitosa
            expect(resetRequestResponse.status()).toBe(200);

            // Act 2: Intentar login con password antigua (debe fallar)
            const oldPasswordResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Assert 2: Login fallido (password no cambiada aún)
            expect(oldPasswordResponse.status()).toBe(401);
        });

        test('TC_E2E_AUTH_009: Flujo de cambio de rol de usuario', async () => {
            // Arrange: Login como admin
            const adminLoginResponse = await authUtils.login(
                TestUsers.ADMIN.email,
                TestUsers.ADMIN.password
            );

            const adminData = await adminLoginResponse.json();

            if (!adminData.requiresTwoFactor) {
                // Act 1: Cambiar rol de usuario
                const roleChangeResponse = await authUtils.changeUserRole(
                    adminData.accessToken,
                    TestUsers.USER.id,
                    3 // Nuevo rol
                );

                // Assert 1: Cambio exitoso
                expect(roleChangeResponse.status()).toBe(200);

                // Act 2: Verificar que el usuario tiene nuevo rol
                const userProfileResponse = await authUtils.getUserProfile(
                    adminData.accessToken,
                    TestUsers.USER.id
                );

                // Assert 2: Rol actualizado
                expect(userProfileResponse.status()).toBe(200);
                const userData = await userProfileResponse.json();
                expect(userData.roleId).toBe(3);
            }
        });

        test('TC_E2E_AUTH_010: Flujo de auditoría completa', async () => {
            // Act 1: Login exitoso
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act 2: Realizar acción auditada
                await authUtils.accessAdminEndpoint(loginData.accessToken);

                // Act 3: Logout
                await authUtils.logout(loginData.accessToken);

                // Assert: Verificar auditoría completa
                const auditCheck = await authUtils.checkCompleteAuditTrail(TestUsers.SUPER_ADMIN.email);
                expect(auditCheck).toBe(true);
            }
        });
    });

    // ===== CRITICAL USER JOURNEYS =====
    test.describe('Critical User Journeys', () => {
        test('TC_E2E_AUTH_011: Jornada crítica - Primer login de nuevo usuario', async () => {
            // Arrange: Nuevo usuario (simulado)
            const newUser = {
                email: 'newuser@test.com',
                password: 'TempPass123!',
                roleId: 1
            };

            // Act 1: Crear usuario
            const createResponse = await authUtils.createUser(newUser);

            // Assert 1: Usuario creado
            expect(createResponse.status()).toBe(201);

            // Act 2: Login del nuevo usuario
            const loginResponse = await authUtils.login(newUser.email, newUser.password);

            // Assert 2: Login exitoso
            expect(loginResponse.status()).toBe(200);

            // Act 3: Forzar cambio de password
            const changePasswordResponse = await authUtils.changePassword(
                'temp_token', // Token del login
                newUser.password,
                'NewSecurePass123!'
            );

            // Assert 3: Password cambiada
            expect(changePasswordResponse.status()).toBe(200);
        });

        test('TC_E2E_AUTH_012: Jornada crítica - Recuperación de cuenta con 2FA', async () => {
            // Arrange: Usuario con 2FA bloqueado
            const blockedUser = TestUsers.SUPER_ADMIN;

            // Act 1: Solicitar recuperación
            const recoveryResponse = await authUtils.requestAccountRecovery(blockedUser.email);

            // Assert 1: Solicitud enviada
            expect(recoveryResponse.status()).toBe(200);

            // Act 2: Completar recuperación con backup code
            const recoveryData = await recoveryResponse.json();
            const backupCode = recoveryData.backupCode; // Simulado

            const completeRecoveryResponse = await authUtils.completeAccountRecovery(
                recoveryData.recoveryToken,
                backupCode
            );

            // Assert 2: Recuperación exitosa
            expect(completeRecoveryResponse.status()).toBe(200);
        });

        test('TC_E2E_AUTH_013: Jornada crítica - Escalada de privilegios', async () => {
            // Arrange: Usuario normal
            const normalUser = TestUsers.USER;

            // Act 1: Login como usuario normal
            const loginResponse = await authUtils.login(normalUser.email, normalUser.password);
            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act 2: Intentar acceso no autorizado
                const adminResponse = await authUtils.accessAdminEndpoint(loginData.accessToken);

                // Assert 2: Acceso denegado
                expect(adminResponse.status()).toBe(403);

                // Act 3: Solicitar escalada de privilegios
                const escalationResponse = await authUtils.requestPrivilegeEscalation(
                    loginData.accessToken,
                    'Necesito acceso temporal para mantenimiento'
                );

                // Assert 3: Solicitud registrada
                expect(escalationResponse.status()).toBe(200);
            }
        });
    });

    // ===== PERFORMANCE SCENARIOS =====
    test.describe('Performance Scenarios', () => {
        test('TC_E2E_AUTH_014: Rendimiento bajo carga - múltiples usuarios simultáneos', async () => {
            // Arrange: Simular carga con múltiples usuarios
            const users = [TestUsers.SUPER_ADMIN, TestUsers.ADMIN, TestUsers.USER];
            const startTime = Date.now();

            // Act: Múltiples logins simultáneos
            const loginPromises = users.flatMap(user =>
                Array(5).fill(null).map(() =>
                    authUtils.login(user.email, user.password)
                )
            );

            const responses = await Promise.all(loginPromises);
            const endTime = Date.now();

            // Assert: Todos los logins completados en tiempo razonable
            const totalTime = endTime - startTime;
            expect(totalTime).toBeLessThan(5000); // Menos de 5 segundos

            const successRate = responses.filter(r => r.status() === 200).length / responses.length;
            expect(successRate).toBeGreaterThan(0.95); // 95% de éxito mínimo
        });

        test('TC_E2E_AUTH_015: Persistencia de sesión bajo estrés', async () => {
            // Arrange: Login inicial
            const loginResponse = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            const loginData = await loginResponse.json();

            if (!loginData.requiresTwoFactor) {
                // Act: Múltiples operaciones simultáneas con el mismo token
                const operations = Array(20).fill(null).map(() =>
                    authUtils.getProfile(loginData.accessToken)
                );

                const responses = await Promise.all(operations);

                // Assert: Todas las operaciones exitosas
                const successCount = responses.filter(r => r.status() === 200).length;
                expect(successCount).toBe(20);
            }
        });
    });
});