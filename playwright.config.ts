import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot only when test fails */
    screenshot: 'only-on-failure',

    /* Record video only when test fails */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'auth-black-box',
      testDir: './tests/black-box',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        /* Test against API only */
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'auth-white-box',
      testDir: './tests/white-box',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'auth-integration',
      testDir: './tests/integration',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'auth-e2e',
      testDir: './tests/e2e',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'auth-full-suite',
      testDir: './tests',
      testMatch: '**/auth/**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start:dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },

  /* Global test timeout */
  timeout: 60 * 1000, // 1 minute

  /* Expect timeout */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),
});