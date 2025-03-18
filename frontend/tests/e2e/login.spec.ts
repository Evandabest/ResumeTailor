import { test, expect } from '@playwright/test';

test('successful login flow', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');

  // Verify we're on the login page
  await expect(page.getByRole('heading', { name: /resumetailor/i })).toBeVisible();

  // Fill in login credentials
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('password123');

  // Submit the form
  await page.getByRole('button', { name: /log in/i }).click();

  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText(/welcome back/i)).toBeVisible();
});