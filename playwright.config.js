import { defineConfig, devices } from 'playwright/test';

const executablePath = process.env.CHROME_PATH || undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'phone',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
  },
});
