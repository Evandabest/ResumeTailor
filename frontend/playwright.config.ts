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
    reuseExistingServer: true, // Allow reusing existing server
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120000, // Increase timeout for server start
  }
});
