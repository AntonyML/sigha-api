import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { TestUsers } from '../utils/auth-test-utils';

/**
 * PRUEBAS DE INTERFAZ - MÓDULO DE USUARIOS CON SELENIUM
 *
 * Enfoque: Pruebas funcionales de GUI para gestión de usuarios.
 */

describe('USERS MODULE - SELENIUM GUI TESTING', () => {
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
        // Login primero
        await driver.get('http://localhost:3000/login');
        const emailInput = await driver.findElement(By.id('email'));
        const passwordInput = await driver.findElement(By.id('password'));
        const loginButton = await driver.findElement(By.id('login-button'));

        await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
        await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
        await loginButton.click();

        await driver.wait(until.urlContains('/dashboard'), 5000);
    });

    test('TC_GUI_USERS_001: Ver lista de usuarios debería mostrar tabla con usuarios', async () => {
        // Navegar a página de usuarios
        await driver.get('http://localhost:3000/users');

        // Verificar que la tabla de usuarios esté presente
        const usersTable = await driver.wait(until.elementLocated(By.id('users-table')), 5000);
        expect(usersTable).toBeTruthy();

        // Verificar que haya al menos un usuario
        const userRows = await driver.findElements(By.css('#users-table tbody tr'));
        expect(userRows.length).toBeGreaterThan(0);

        // Verificar que el primer usuario tenga email
        const firstUserEmail = await driver.findElement(By.css('#users-table tbody tr:first-child .user-email'));
        const emailText = await firstUserEmail.getText();
        expect(emailText).toContain('@');
    });

    test('TC_GUI_USERS_002: Ver perfil propio debería mostrar datos del usuario logueado', async () => {
        // Navegar a perfil
        await driver.get('http://localhost:3000/profile');

        // Verificar datos del perfil
        const profileEmail = await driver.wait(until.elementLocated(By.id('profile-email')), 5000);
        const emailText = await profileEmail.getText();
        expect(emailText).toBe(TestUsers.SUPER_ADMIN.email);

        const profileName = await driver.findElement(By.id('profile-name'));
        const nameText = await profileName.getText();
        expect(nameText).toBeTruthy();
    });

    test('TC_GUI_USERS_003: Buscar usuario debería filtrar la lista', async () => {
        await driver.get('http://localhost:3000/users');

        // Ingresar término de búsqueda
        const searchInput = await driver.findElement(By.id('user-search'));
        await searchInput.sendKeys(TestUsers.SUPER_ADMIN.email);

        const searchButton = await driver.findElement(By.id('search-button'));
        await searchButton.click();

        // Verificar que solo aparezca el usuario buscado
        await driver.wait(until.elementLocated(By.css('.user-email')), 5000);
        const visibleEmails = await driver.findElements(By.css('.user-email'));
        expect(visibleEmails.length).toBeGreaterThan(0);

        const firstVisibleEmail = await visibleEmails[0].getText();
        expect(firstVisibleEmail).toBe(TestUsers.SUPER_ADMIN.email);
    });

    test('TC_GUI_USERS_004: Ver detalles de usuario debería mostrar información completa', async () => {
        await driver.get('http://localhost:3000/users');

        // Hacer clic en el primer usuario de la lista
        const firstUserLink = await driver.findElement(By.css('#users-table tbody tr:first-child .user-link'));
        await firstUserLink.click();

        // Verificar página de detalles
        await driver.wait(until.urlContains('/users/'), 5000);
        const userDetails = await driver.findElement(By.id('user-details'));
        expect(userDetails).toBeTruthy();

        // Verificar campos de detalles
        const detailEmail = await driver.findElement(By.id('detail-email'));
        const emailText = await detailEmail.getText();
        expect(emailText).toContain('@');
    });

    test('TC_GUI_USERS_005: Editar perfil debería actualizar datos', async () => {
        await driver.get('http://localhost:3000/profile');

        // Hacer clic en editar
        const editButton = await driver.findElement(By.id('edit-profile-button'));
        await editButton.click();

        // Modificar nombre
        const nameInput = await driver.findElement(By.id('edit-name'));
        await nameInput.clear();
        await nameInput.sendKeys('Updated Name');

        // Guardar
        const saveButton = await driver.findElement(By.id('save-profile-button'));
        await saveButton.click();

        // Verificar actualización
        await driver.wait(until.elementLocated(By.id('profile-name')), 5000);
        const updatedName = await driver.findElement(By.id('profile-name'));
        const nameText = await updatedName.getText();
        expect(nameText).toBe('Updated Name');
    });
});