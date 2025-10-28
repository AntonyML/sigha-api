import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers } from '../../utils/auth-test-utils';

/**
 * PRUEBAS SIMPLES - MÓDULO DE AUDITORÍA
 *
 * Tests básicos para verificar funcionalidad de auditoría.
 */

test.describe('AUDIT MODULE - SIMPLE TESTS', () => {
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

    test('Listar registros de auditoría', async ({ playwright }) => {
        const request = await playwright.request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Listar audits
        const listResponse = await request.get('/audits');

        expect(listResponse.status()).toBe(200);
        const data = await listResponse.json();
        // Assuming it returns an object with records
        expect(data).toBeDefined();
    });

    test('Obtener estadísticas de auditoría', async ({ playwright }) => {
        const request = await playwright.request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Obtener stats
        const statsResponse = await request.get('/audits/stats');

        expect(statsResponse.status()).toBe(200);
        const data = await statsResponse.json();
        expect(data).toHaveProperty('totalActions');
    });
});