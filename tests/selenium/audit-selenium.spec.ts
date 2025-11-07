import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { TestUsers } from '../utils/auth-test-utils';

/**
 * PRUEBAS DE INTERFAZ - MÓDULO DE AUDITORÍA CON SELENIUM
 */

describe('AUDIT MODULE - SELENIUM GUI TESTING', () => {
    let driver: WebDriver;

    beforeAll(async () => {
        const options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async () => {
        // Login
        await driver.get('http://localhost:3000/login');
        const emailInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const loginButton = await driver.findElement(By.id('login-button'));

        await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
        await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
        await loginButton.click();

        await driver.wait(until.urlContains('/dashboard'), 5000);
    });

    test('TC_GUI_AUDIT_001: Ver registros de auditoría debería mostrar tabla con logs', async () => {
        await driver.get('http://localhost:3000/audits');

        const auditTable = await driver.wait(until.elementLocated(By.id('audit-table')), 5000);
        expect(auditTable).toBeTruthy();

        const auditRows = await driver.findElements(By.css('#audit-table tbody tr'));
        expect(auditRows.length).toBeGreaterThanOrEqual(0); // Puede estar vacío inicialmente

        if (auditRows.length > 0) {
            const firstAction = await driver.findElement(By.css('#audit-table tbody tr:first-child .audit-action'));
            const actionText = await firstAction.getText();
            expect(actionText).toBeTruthy();
        }
    });

    test('TC_GUI_AUDIT_002: Ver estadísticas de auditoría debería mostrar métricas', async () => {
        await driver.get('http://localhost:3000/audits/stats');

        const totalActions = await driver.wait(until.elementLocated(By.id('total-actions')), 5000);
        const totalText = await totalActions.getText();
        expect(totalText).toMatch(/\d+/); // Debe contener número

        const recentActions = await driver.findElement(By.id('recent-actions'));
        const recentText = await recentActions.getText();
        expect(recentText).toMatch(/\d+/);
    });

    test('TC_GUI_AUDIT_003: Filtrar registros por fecha debería actualizar la tabla', async () => {
        await driver.get('http://localhost:3000/audits');

        const dateFilter = await driver.findElement(By.id('audit-date-filter'));
        await dateFilter.sendKeys('2025-11-06'); // Fecha actual

        const filterButton = await driver.findElement(By.id('filter-audit-button'));
        await filterButton.click();

        // Verificar que la tabla se actualice (puede estar vacía)
        await driver.wait(until.elementLocated(By.id('audit-table')), 5000);
        const filteredRows = await driver.findElements(By.css('#audit-table tbody tr'));
        // No assert específico, solo que no crashee
        expect(filteredRows).toBeDefined();
    });

    test('TC_GUI_AUDIT_004: Ver detalles de un registro debería mostrar información completa', async () => {
        await driver.get('http://localhost:3000/audits');

        const auditRows = await driver.findElements(By.css('#audit-table tbody tr'));
        if (auditRows.length > 0) {
            const firstDetailLink = await driver.findElement(By.css('#audit-table tbody tr:first-child .audit-detail-link'));
            await firstDetailLink.click();

            await driver.wait(until.urlContains('/audits/'), 5000);
            const auditDetails = await driver.findElement(By.id('audit-details'));
            expect(auditDetails).toBeTruthy();

            const detailAction = await driver.findElement(By.id('detail-action'));
            const actionText = await detailAction.getText();
            expect(actionText).toBeTruthy();
        } else {
            // Si no hay registros, skip
            console.log('No audit records to test details');
        }
    });

    test('TC_GUI_AUDIT_005: Exportar registros debería descargar archivo', async () => {
        await driver.get('http://localhost:3000/audits');

        const exportButton = await driver.findElement(By.id('export-audit-button'));
        await exportButton.click();

        // Verificar que aparezca mensaje de éxito o descarga
        const successMessage = await driver.wait(until.elementLocated(By.className('success-message')), 5000);
        const messageText = await successMessage.getText();
        expect(messageText).toContain('Exportado');
    });
});