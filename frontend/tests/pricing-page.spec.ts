import { test, expect } from '@playwright/test';

test.describe('Pricing Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should display pricing header and description', async ({ page }) => {
    // Verify page heading and description
    await expect(page.getByRole('heading', { name: 'Resume Generation Tokens' })).toBeVisible();
    await expect(page.getByText('Every user gets 10 free tokens monthly')).toBeVisible();
    await expect(page.getByText('All features included for everyone!')).toBeVisible();
  });

  test('should display included features', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Features Included For Everyone' })).toBeVisible();
    
    const features = [
      'Advanced GitHub integration',
      'All export formats (PDF, DOCX, LaTeX)',
      'Resume performance analytics',
      'Priority support'
    ];

    for (const feature of features) {
      await expect(page.getByText(feature)).toBeVisible();
    }
  });

  test('should display FAQ section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Frequently Asked Questions' })).toBeVisible();
    
    // Verify FAQ questions and answers
    await expect(page.getByText('How do tokens work?')).toBeVisible();
    await expect(page.getByText('Do tokens expire?')).toBeVisible();
    await expect(page.getByText('Can I share tokens?')).toBeVisible();
    
    // Verify specific answer content
    await expect(page.getByText(/Each resume generation uses one token/)).toBeVisible();
    await expect(page.getByText(/purchased tokens never expire/)).toBeVisible();
  });

});
