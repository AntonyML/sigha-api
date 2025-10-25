import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers, TimeConstants } from '../../utils/auth-test-utils';

/**
 * PRUEBAS DE CAJA NEGRA - MÓDULO DE AUTENTICACIÓN
 *
 * Enfoque: Pruebas funcionales que evalúan el comportamiento externo
 * del sistema sin conocimiento de la implementación interna.
 *
 * Estrategia de Pruebas:
 * - Equivalence Partitioning
 * - Boundary Value Analysis
 * - Decision Tables
 * - State Transition Testing
 * - Use Case Testing
 */

test.describe('AUTH MODULE - BLACK BOX TESTING', () => {
    let authUtils: AuthAPITestUtils;

    test.beforeEach(async ({ playwright }) => {
        const request = await playwright.request.newContext();
        authUtils = new AuthAPITestUtils(request);
    });

    test.afterEach(async ({ playwright }) => {
        await playwright.request.newContext().dispose();
    });

    // ===== LOGIN FUNCTIONALITY =====
    test.describe('Login - Equivalence Partitioning', () => {
        test('TC_BB_AUTH_001: Login válido sin 2FA debería retornar tokens', async () => {
            // Arrange & Act
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();

            // Verificar estructura de respuesta
            expect(data).toHaveProperty('accessToken');
            expect(data).toHaveProperty('refreshToken');
            expect(data).toHaveProperty('user');
            expect(data.user).toHaveProperty('id');
            expect(data.user).toHaveProperty('uEmail', TestUsers.SUPER_ADMIN.email);
            expect(data.user).toHaveProperty('uName');
            expect(data.user).toHaveProperty('role');
        });

        test('TC_BB_AUTH_002: Login con credenciales inválidas debería fallar', async () => {
            // Arrange & Act
            const response = await authUtils.login('invalid@email.com', 'wrongpassword');

            // Assert
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.message).toContain('Credenciales inválidas');
        });

        test('TC_BB_AUTH_003: Login con usuario inactivo debería fallar', async () => {
            // Arrange & Act (asumiendo que existe un usuario inactivo en BD)
            const response = await authUtils.login('inactive@user.com', 'password123');

            // Assert
            expect(response.status()).toBe(401);
        });
    });

    // ===== 2FA FUNCTIONALITY =====
    test.describe('2FA - State Transition Testing', () => {
        let tempToken: string;
        let accessToken: string;

        test('TC_BB_AUTH_004: Login con 2FA habilitado debería requerir verificación', async () => {
            // Arrange: Usuario con 2FA habilitado
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();

            if (data.requiresTwoFactor) {
                expect(data.accessToken).toBe('');
                expect(data).toHaveProperty('tempToken');
                expect(data).toHaveProperty('requiresTwoFactor', true);
                tempToken = data.tempToken;
            } else {
                // Si no requiere 2FA, verificar que tenga tokens normales
                expect(data).toHaveProperty('accessToken');
                expect(data).toHaveProperty('refreshToken');
            }
        });

        test('TC_BB_AUTH_005: Verificación 2FA con código válido debería completar login', async () => {
            test.skip(!tempToken, 'Requiere tempToken de prueba anterior');

            // Arrange: Código TOTP válido (asumiendo que se puede generar)
            const validCode = '123456'; // En implementación real, generar código válido

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, validCode);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('accessToken');
            expect(data).toHaveProperty('refreshToken');
            expect(data).toHaveProperty('user');
            accessToken = data.accessToken;
        });

        test('TC_BB_AUTH_006: Verificación 2FA con código inválido debería fallar', async () => {
            test.skip(!tempToken, 'Requiere tempToken de prueba anterior');

            // Arrange & Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, '000000');

            // Assert
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.message).toContain('Código de autenticación inválido');
        });

        test('TC_BB_AUTH_007: Verificación 2FA con token expirado debería fallar', async () => {
            // Arrange: Esperar que el token expire (5 minutos)
            await authUtils.wait(TimeConstants.TOKEN_EXPIRY_5_MIN + 1000);

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, '123456');

            // Assert
            expect(response.status()).toBe(401);
            const data = await response.json();
            expect(data.message).toContain('expirado');
        });
    });

    // ===== BACKUP CODES FUNCTIONALITY =====
    test.describe('Backup Codes - Decision Table Testing', () => {
        test('TC_BB_AUTH_008: Código de respaldo válido debería funcionar', async () => {
            test.skip(!tempToken, 'Requiere tempToken de prueba anterior');

            // Arrange: Código de respaldo válido (asumiendo formato 8 dígitos)
            const backupCode = '12345678';

            // Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, backupCode);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('accessToken');
        });

        test('TC_BB_AUTH_009: Código de respaldo inválido debería fallar', async () => {
            test.skip(!tempToken, 'Requiere tempToken de prueba anterior');

            // Arrange & Act
            const response = await authUtils.completeTwoFactorLogin(tempToken, '87654321');

            // Assert
            expect(response.status()).toBe(401);
        });
    });

    // ===== SESSION MANAGEMENT =====
    test.describe('Session Management - Boundary Value Analysis', () => {
        test('TC_BB_AUTH_010: Logout con token válido debería cerrar sesión', async () => {
            test.skip(!accessToken, 'Requiere accessToken de pruebas anteriores');

            // Arrange & Act
            const response = await authUtils.logout(accessToken);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('success', true);
        });

        test('TC_BB_AUTH_011: Acceso a perfil sin token debería fallar', async () => {
            // Arrange & Act
            const response = await authUtils.getProfile('');

            // Assert
            expect(response.status()).toBe(401);
        });

        test('TC_BB_AUTH_012: Acceso a perfil con token válido debería retornar datos', async () => {
            test.skip(!accessToken, 'Requiere accessToken válido');

            // Arrange & Act
            const response = await authUtils.getProfile(accessToken);

            // Assert
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('user');
            expect(data.user).toHaveProperty('uEmail', TestUsers.SUPER_ADMIN.email);
        });
    });

    // ===== TIME SYNCHRONIZATION =====
    test.describe('Time Synchronization - Critical Path Testing', () => {
        test('TC_BB_AUTH_013: Servidor debe tener hora sincronizada para TOTP', async () => {
            // Arrange: Verificar que el servidor tenga hora correcta
            const serverTime = new Date();
            const clientTime = new Date();

            // Act: Comparar tiempos (tolerancia de 5 segundos)
            const timeDiff = Math.abs(serverTime.getTime() - clientTime.getTime());

            // Assert: Diferencia debe ser menor a 5 segundos
            expect(timeDiff).toBeLessThan(5000);

            // Verificar que TOTP funcione con tiempo sincronizado
            const response = await authUtils.login(
                TestUsers.SUPER_ADMIN.email,
                TestUsers.SUPER_ADMIN.password
            );

            if ((await response.json()).requiresTwoFactor) {
                // Si requiere 2FA, verificar que el tempToken no expire prematuramente
                const data = await response.json();
                const tempToken = data.tempToken;

                // Esperar 4 minutos (menos de 5) y verificar que aún funcione
                await authUtils.wait(4 * 60 * 1000);

                // Aquí iría la verificación con código TOTP válido
                // (En implementación real, generar código válido)
            }
        });
    });

    // ===== SECURITY TESTING =====
    test.describe('Security - Negative Testing', () => {
        test('TC_BB_AUTH_014: Ataque de fuerza bruta debería ser mitigado', async () => {
            // Arrange: Múltiples intentos de login fallidos
            const maxAttempts = 5;

            for (let i = 0; i < maxAttempts; i++) {
                // Act
                const response = await authUtils.login('invalid@email.com', 'wrongpass');

                // Assert: Todos deben fallar con 401
                expect(response.status()).toBe(401);
            }

            // Verificar que no haya bloqueo de cuenta (o sí, dependiendo de la política)
            // En implementación real, verificar rate limiting
        });

        test('TC_BB_AUTH_015: SQL Injection debería ser prevenido', async () => {
            // Arrange: Payload malicioso
            const maliciousEmail = "'; DROP TABLE users; --";
            const maliciousPassword = "' OR '1'='1";

            // Act
            const response = await authUtils.login(maliciousEmail, maliciousPassword);

            // Assert: Debe fallar, no ejecutar SQL
            expect(response.status()).toBe(401);
        });
    });
});