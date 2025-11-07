import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { TestUsers } from '../utils/auth-test-utils'; // Reutilizar utils si es posible

/**
 * PRUEBAS DE INTERFAZ - MÓDULO DE AUTENTICACIÓN CON SELENIUM
 *
 * Enfoque: Pruebas funcionales de GUI que evalúan el comportamiento
 * del sistema a través de la interfaz de usuario.
 *
 * Estrategia de Pruebas:
 * - Equivalence Partitioning
 * - Boundary Value Analysis
 * - Decision Tables
 * - State Transition Testing
 * - Use Case Testing
 */

describe('AUTH MODULE - SELENIUM GUI TESTING', () => {
    let driver: WebDriver;

    beforeAll(async () => {
        // Configurar ChromeDriver
        const options = new chrome.Options();
        options.addArguments('--headless'); // Ejecutar sin interfaz gráfica
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
        // Navegar a la página de login antes de cada test
        await driver.get('http://localhost:3000/login'); // Ajustar URL según tu frontend
    });

    // ===== LOGIN FUNCTIONALITY =====
    describe('Login - Equivalence Partitioning', () => {
        test('TC_GUI_AUTH_001: Login válido debería redirigir al dashboard', async () => {
            // Arrange: Ingresar credenciales válidas
            const emailInput = await driver.findElement(By.id('email')); // Ajustar selectores según tu HTML
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
            await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
            await loginButton.click();

            // Assert: Verificar redirección al dashboard
            await driver.wait(until.urlContains('/dashboard'), 5000);
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).toContain('/dashboard');
        });

        test('TC_GUI_AUTH_002: Login con credenciales inválidas debería mostrar error', async () => {
            // Arrange: Ingresar credenciales inválidas
            const emailInput = await driver.findElement(By.id('email'));
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys('invalid@email.com');
            await passwordInput.sendKeys('wrongpassword');
            await loginButton.click();

            // Assert: Verificar mensaje de error
            const errorMessage = await driver.wait(until.elementLocated(By.className('error-message')), 5000);
            const errorText = await errorMessage.getText();
            expect(errorText).toContain('Credenciales inválidas');
        });

        test('TC_GUI_AUTH_003: Login con usuario inactivo debería mostrar error', async () => {
            // Arrange: Ingresar credenciales de usuario inactivo
            const emailInput = await driver.findElement(By.id('email'));
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys('inactive@user.com');
            await passwordInput.sendKeys('password123');
            await loginButton.click();

            // Assert: Verificar mensaje de error
            const errorMessage = await driver.wait(until.elementLocated(By.className('error-message')), 5000);
            const errorText = await errorMessage.getText();
            expect(errorText).toContain('Usuario inactivo');
        });

        test('TC_GUI_AUTH_004: Login con email vacío debería mostrar validación', async () => {
            // Arrange: Dejar email vacío
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
            await loginButton.click();

            // Assert: Verificar validación
            const emailError = await driver.wait(until.elementLocated(By.id('email-error')), 5000);
            const errorText = await emailError.getText();
            expect(errorText).toContain('Email requerido');
        });

        test('TC_GUI_AUTH_005: Login con password vacío debería mostrar validación', async () => {
            // Arrange: Dejar password vacío
            const emailInput = await driver.findElement(By.id('email'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
            await loginButton.click();

            // Assert: Verificar validación
            const passwordError = await driver.wait(until.elementLocated(By.id('password-error')), 5000);
            const errorText = await passwordError.getText();
            expect(errorText).toContain('Contraseña requerida');
        });
    });

    // ===== LOGOUT FUNCTIONALITY =====
    describe('Logout - State Transition Testing', () => {
        test('TC_GUI_AUTH_006: Logout debería redirigir a login', async () => {
            // Arrange: Login primero
            const emailInput = await driver.findElement(By.id('email'));
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
            await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
            await loginButton.click();

            await driver.wait(until.urlContains('/dashboard'), 5000);

            // Act: Logout
            const logoutButton = await driver.findElement(By.id('logout-button'));
            await logoutButton.click();

            // Assert: Verificar redirección a login
            await driver.wait(until.urlContains('/login'), 5000);
            const currentUrl = await driver.getCurrentUrl();
            expect(currentUrl).toContain('/login');
        });
    });

    // ===== 2FA FUNCTIONALITY =====
    describe('2FA - Decision Table Testing', () => {
        test('TC_GUI_AUTH_007: Login con 2FA habilitado debería mostrar campo de código', async () => {
            // Arrange: Usuario con 2FA habilitado
            const emailInput = await driver.findElement(By.id('email'));
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
            await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
            await loginButton.click();

            // Assert: Verificar que aparezca campo de 2FA
            const twoFactorInput = await driver.wait(until.elementLocated(By.id('two-factor-code')), 5000);
            expect(twoFactorInput).toBeTruthy();
        });

        test('TC_GUI_AUTH_008: Código 2FA inválido debería mostrar error', async () => {
            // Arrange: Login con 2FA
            const emailInput = await driver.findElement(By.id('email'));
            const passwordInput = await driver.findElement(By.id('password'));
            const loginButton = await driver.findElement(By.id('login-button'));

            await emailInput.sendKeys(TestUsers.SUPER_ADMIN.email);
            await passwordInput.sendKeys(TestUsers.SUPER_ADMIN.password);
            await loginButton.click();

            // Act: Ingresar código inválido
            const twoFactorInput = await driver.findElement(By.id('two-factor-code'));
            const verifyButton = await driver.findElement(By.id('verify-button'));

            await twoFactorInput.sendKeys('000000');
            await verifyButton.click();

            // Assert: Verificar error
            const errorMessage = await driver.wait(until.elementLocated(By.className('error-message')), 5000);
            const errorText = await errorMessage.getText();
            expect(errorText).toContain('Código inválido');
        });
    });
});