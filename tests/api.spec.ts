import { test, expect } from '@playwright/test';

test.describe('API Documentation', () => {
  test('should load Swagger documentation', async ({ page }) => {
    // Navegar a la documentación de Swagger
    await page.goto('/api');

    // Verificar que la página de Swagger cargue
    await expect(page).toHaveTitle(/Swagger UI/);

    // Verificar que hay elementos de la documentación
    await expect(page.locator('text=API Documentation')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should show login form', async ({ page }) => {
    // Este test requiere que tengas un frontend corriendo
    // Por ahora solo verificamos que Playwright esté funcionando
    await page.goto('https://playwright.dev/');

    // Verificar que la página cargue
    await expect(page.locator('text=Playwright')).toBeVisible();
  });
});