import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers } from '../../utils/auth-test-utils';

/**
 * PRUEBAS SIMPLES - MÓDULO DE USUARIOS
 *
 * Tests básicos para verificar funcionalidad de usuarios.
 */

test.describe('USERS MODULE - SIMPLE TESTS', () => {
    let authUtils: AuthAPITestUtils;
    let accessToken: string;

    test.beforeEach(async ({ playwright }) => {
        const request = await playwright.request.newContext();
        authUtils = new AuthAPITestUtils(request);

        // Login para obtener token
        const loginResponse = await authUtils.login(
            TestUsers.SUPER_ADMIN.email,
            TestUsers.SUPER_ADMIN.password
        );
        expect(loginResponse.status()).toBe(200);
        const loginData = await loginResponse.json();
        accessToken = loginData.accessToken;
    });

    test('Listar usuarios', async ({ playwright }) => {
        const request = await playwright.request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Listar usuarios
        const listResponse = await request.get('/users');

        expect(listResponse.status()).toBe(200);
        const data = await listResponse.json();
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        expect(data[0]).toHaveProperty('uEmail');
    });

    test('Obtener perfil propio', async ({ playwright }) => {
        const request = await playwright.request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Obtener perfil
        const profileResponse = await request.get('/users/profile');

        expect(profileResponse.status()).toBe(200);
        const data = await profileResponse.json();
        expect(data).toHaveProperty('uEmail', TestUsers.SUPER_ADMIN.email);
    });
});