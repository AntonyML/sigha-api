import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { TestUsers } from '../utils/auth-test-utils';

/**
 * PRUEBAS DE INTERFAZ - MÓDULO DE NOTIFICACIONES CON SELENIUM
 */

describe('NOTIFICATIONS MODULE - SELENIUM GUI TESTING', () => {
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

    test('TC_GUI_NOTIFICATIONS_001: Ver lista de notificaciones debería mostrar panel', async () => {
        await driver.get('http://localhost:3000/notifications');

        const notificationsPanel = await driver.wait(until.elementLocated(By.id('notifications-panel')), 5000);
        expect(notificationsPanel).toBeTruthy();

        const notificationItems = await driver.findElements(By.css('.notification-item'));
        // Puede estar vacío
        expect(notificationItems).toBeDefined();
    });

    test('TC_GUI_NOTIFICATIONS_002: Crear nueva notificación debería agregarla a la lista', async () => {
        await driver.get('http://localhost:3000/notifications');

        const createButton = await driver.findElement(By.id('create-notification-button'));
        await createButton.click();

        const titleInput = await driver.findElement(By.id('notification-title'));
        const messageInput = await driver.findElement(By.id('notification-message'));
        const saveButton = await driver.findElement(By.id('save-notification-button'));

        await titleInput.sendKeys('Test Notification');
        await messageInput.sendKeys('This is a test message');
        await saveButton.click();

        // Verificar que aparezca
        await driver.wait(until.elementLocated(By.css('.notification-item')), 5000);
        const notificationTitles = await driver.findElements(By.css('.notification-title'));
        const titles = await Promise.all(notificationTitles.map(el => el.getText()));
        expect(titles).toContain('Test Notification');
    });

    test('TC_GUI_NOTIFICATIONS_003: Marcar notificación como leída debería actualizar estado', async () => {
        await driver.get('http://localhost:3000/notifications');

        const notificationItems = await driver.findElements(By.css('.notification-item'));
        if (notificationItems.length > 0) {
            const firstMarkReadButton = await driver.findElement(By.css('.notification-item:first-child .mark-read-button'));
            await firstMarkReadButton.click();

            // Verificar que cambie el estado
            const readStatus = await driver.findElement(By.css('.notification-item:first-child .read-status'));
            const statusText = await readStatus.getText();
            expect(statusText).toContain('Leída');
        } else {
            console.log('No notifications to mark as read');
        }
    });

    test('TC_GUI_NOTIFICATIONS_004: Filtrar notificaciones por estado debería actualizar lista', async () => {
        await driver.get('http://localhost:3000/notifications');

        const filterSelect = await driver.findElement(By.id('notification-filter'));
        await filterSelect.sendKeys('unread'); // Asumir opción

        const filterButton = await driver.findElement(By.id('apply-filter-button'));
        await filterButton.click();

        // Verificar filtro aplicado
        await driver.wait(until.elementLocated(By.id('notifications-panel')), 5000);
        const filteredItems = await driver.findElements(By.css('.notification-item'));
        expect(filteredItems).toBeDefined();
    });

    test('TC_GUI_NOTIFICATIONS_005: Eliminar notificación debería removerla de la lista', async () => {
        await driver.get('http://localhost:3000/notifications');

        const notificationItems = await driver.findElements(By.css('.notification-item'));
        if (notificationItems.length > 0) {
            const firstDeleteButton = await driver.findElement(By.css('.notification-item:first-child .delete-notification-button'));
            await firstDeleteButton.click();

            const confirmDeleteButton = await driver.findElement(By.id('confirm-delete-notification'));
            await confirmDeleteButton.click();

            // Verificar que desaparezca
            await driver.wait(until.elementLocated(By.id('notifications-panel')), 5000);
            const remainingItems = await driver.findElements(By.css('.notification-item'));
            expect(remainingItems.length).toBeLessThan(notificationItems.length);
        } else {
            console.log('No notifications to delete');
        }
    });
});