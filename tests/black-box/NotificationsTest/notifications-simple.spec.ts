import { test, expect } from '@playwright/test';
import { AuthAPITestUtils, TestUsers } from '../../utils/auth-test-utils';

/**
 * PRUEBAS SIMPLES - MÓDULO DE NOTIFICACIONES
 *
 * Tests básicos para verificar funcionalidad de notificaciones.
 */

test.describe('NOTIFICATIONS MODULE - SIMPLE TESTS', () => {
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

    test('Crear notificación simple', async ({ playwright }) => {
        const request = await playwright.request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Crear notificación
        const createResponse = await request.post('/notifications', {
            data: {
                nTitle: 'Test Notification',
                nMessage: 'This is a test message',
            },
        });

        expect(createResponse.status()).toBe(201);
        const data = await createResponse.json();
        expect(data).toHaveProperty('id');
        expect(data.nTitle).toBe('Test Notification');
    });

    test('Listar notificaciones', async ({ playwright }) => {
        const request = await playwright.request.newContext({
            extraHTTPHeaders: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        // Listar notificaciones
        const listResponse = await request.get('/notifications');

        expect(listResponse.status()).toBe(200);
        const data = await listResponse.json();
        expect(data).toBeDefined();
    });
});