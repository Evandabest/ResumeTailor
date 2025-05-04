const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000, // Global timeout for each test
  expect: {
    timeout: 10000 // Timeout for assertions
  },
  reporter: 'html',
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'http://localhost:3000',
  },
  retries: process.env.CI ? 2 : 0, // Retry twice in CI, no retries locally
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  }
});
