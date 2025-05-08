import { test, expect } from '@playwright/test';

test.describe('Template Selection Flow', () => {
  test('complete template browsing flow', async ({ page }) => {
    // Start from templates page
    await page.goto('/templates');

    // Verify we're on templates page
    await expect(page.getByRole('heading', { name: /resume templates/i })).toBeVisible();

    // Check template categories are visible
    const categories = ['All', 'Modern', 'Traditional', 'Minimal', 'Technical', 'Creative', 'Academic'];
    for (const category of categories) {
      await expect(page.getByRole('tab', { name: category })).toBeVisible();
    }
  });

  test('should handle responsive layout', async ({ page }) => {
    await page.goto('/templates');

    // Test responsive layout for template grid
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1440, height: 900 }   // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Grid container should be visible
      const gridContainer = page.locator('.grid.gap-8');
      await expect(gridContainer).toBeVisible();

      // Check grid class changes based on viewport
      if (viewport.width >= 1024) {  // lg breakpoint
        await expect(gridContainer).toHaveClass(/lg:grid-cols-3/);
      } else if (viewport.width >= 768) {  // md breakpoint
        await expect(gridContainer).toHaveClass(/md:grid-cols-2/);
      }

    }
  });

  test('should filter templates by category', async ({ page }) => {
    await page.goto('/templates');

    // Test category filtering
    const modernTab = page.getByRole('tab', { name: 'Modern' });
    await modernTab.click();
    await expect(page.getByText("Jake's Resume Template")).toBeVisible();

    // Clear filter by clicking All
    const allTab = page.getByRole('tab', { name: 'All' });
    await allTab.click();
    
    // Verify search functionality
    const searchBox = page.getByPlaceholder('Search templates...');
    await searchBox.fill('Technical');
    await expect(page.getByText('Technical Edge')).toBeVisible();
  });
});
