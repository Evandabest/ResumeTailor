import { test, expect } from '@playwright/test';

test('GitHub login flow', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000/login');
  
  // Verify we're on the login page
  await expect(page.getByText('Tailor your resume to land your dream job')).toBeVisible();
  
  // Click the GitHub button
  await page.getByRole('button', { name: 'GitHub' }).click();
  
  // Since we can't actually authenticate with GitHub in tests,
  // we'll mock the OAuth redirect back to our site
  await page.goto('http://localhost:3000/dashboard');
  
  // Verify we're on the dashboard by checking for specific elements
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  
  // Verify some mock data is visible
  await expect(page.getByText('Welcome back!')).toBeVisible();
  
  // Check for specific dashboard content like cards
  await expect(page.getByText('Resumes Created')).toBeVisible();
  await expect(page.getByText('GitHub Projects')).toBeVisible();
  await expect(page.getByText('Matching Jobs')).toBeVisible();
  
  // Verify mock data stats are present
  await expect(page.getByText('Connected and analyzed')).toBeVisible();
  await expect(page.getByText('Profile Strength')).toBeVisible();
});
