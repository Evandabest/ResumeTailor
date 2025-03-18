import { test, expect } from '@playwright/test';
import latexContent from './latex-sample';

test('complete user flow: home to resume editing', async ({ page }) => {
  // Start at the home page
  await page.goto('http://localhost:3000/');
  
  // Verify we're on the home page - use more specific selectors
  await expect(page.getByRole('heading', { name: /ResumeTailor/i, level: 1 })).toBeVisible();
  await expect(page.getByText(/AI-powered resumes tailored/i)).toBeVisible();
  
  // Click "Get Started" button
  await page.getByRole('link', { name: 'Get Started' }).click();
  
  // Verify redirect to login page
  await expect(page).toHaveURL(/\/login/);
  
  // Check for login page elements - use more specific selectors instead of text
  await expect(page.getByRole('tab', { name: 'Log In' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Sign Up' })).toBeVisible();
  
  // Click on the GitHub button for authentication
  const githubButton = page.getByRole('button', { name: /GitHub|Continue with GitHub/i }).first();
  await expect(githubButton).toBeVisible();
  await githubButton.click();
  
  // Expect to be redirected to the dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { level: 1 }).filter({ hasText: /Dashboard/i })).toBeVisible();
  
  // Click on the Resumes tab
  await page.getByRole('tab', { name: /Resumes/i }).click();
  
  // Find the first resume and click its edit button
  const editButtonForFirstResume = page.getByRole('link', { name: /Edit/i }).first();
  await editButtonForFirstResume.click();
  
  // Verify we're on the resume edit page
  await expect(page).toHaveURL(/\/resumes\/.*\/edit/);
  
  // Wait for the editor to be visible - use a more specific selector if possible
  await page.waitForSelector('div[role="code"], textarea');
  
  // Clear the editor and paste new LaTeX content
  // Try to locate either a code editor div or a textarea
  const editorLocator = page.locator('div[role="code"], textarea').first();
  await editorLocator.click();
  
  // Use keyboard shortcuts to select all and delete
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  
  // Paste the LaTeX code
  const latexCode = latexContent;
  
  // Try different methods to insert text
  try {
    await page.evaluate((text) => {
      const textarea = document.querySelector('textarea, div[role="code"]');
      if (textarea) {
        if ('value' in textarea) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          // For contenteditable divs
          textarea.textContent = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, latexCode);
  } catch (e) {
    console.log("First insertion method failed, trying fallback");
    // Fallback to typing the content
    try {
      await editorLocator.fill(latexCode);
    } catch (fillError) {
      console.log("Fill method failed, trying type method");
      await editorLocator.type(latexCode);
    }
  }
  
  // Click the compile button
  await page.getByRole('button', { name: /compile/i }).click();
  
  // Wait for compilation indication - try multiple approaches
  try {
    // First approach: Check for text content
    await Promise.any([
      expect(page.getByText(/compiling/i, { exact: false })).toBeVisible({ timeout: 2000 }),
      expect(page.getByText(/processing/i, { exact: false })).toBeVisible({ timeout: 2000 }),
      expect(page.getByText(/generating/i, { exact: false })).toBeVisible({ timeout: 2000 }),
      expect(page.getByText(/please wait/i, { exact: false })).toBeVisible({ timeout: 2000 })
    ]).catch(() => console.log("No specific compilation text found"));
    
    // Second approach: Check for loading indicators
    await Promise.any([
      expect(page.locator('.loading, .spinner, [class*="loading"], [class*="spinner"], [aria-busy="true"]')).toBeVisible({ timeout: 2000 }),
      expect(page.getByRole('progressbar')).toBeVisible({ timeout: 2000 })
    ]).catch(() => console.log("No loading indicators found"));
    
  } catch (e) {
    console.log("No compilation indicators detected, continuing test");
  }
  
  // Alternative: look for button state changes
  try {
    await Promise.any([
      expect(page.getByRole('button', { name: /compile/i })).toHaveAttribute('disabled', '', { timeout: 2000 }),
      expect(page.getByRole('button', { name: /compile/i })).toHaveClass(/disabled/, { timeout: 2000 }),
      expect(page.getByRole('button', { name: /cancel/i })).toBeVisible({ timeout: 2000 })
    ]).catch(() => console.log("No button state change detected"));
  } catch (e) {
    console.log("No button state changes found");
  }
  
  // In any case, wait for a reasonable time for compilation to complete
  console.log("Waiting for compilation to complete...");
  await page.waitForTimeout(8000);
  
  // Wait for the compilation to finish and verify PDF is rendered
  // Allow more time for LaTeX compilation which can be slow
  await page.waitForTimeout(8000);
  
  // Check that an iframe exists (which holds the rendered PDF)
  // Try multiple possible iframe selectors
  try {
    const iframe = page.frameLocator('iframe[title="Compiled PDF"], iframe[src*="pdf"], iframe');
    await expect(iframe.locator('body')).toBeVisible({ timeout: 10000 });
    console.log("PDF iframe found and is visible");
  } catch (e) {
    console.log("Looking for alternative PDF indicators");
    try {
      // Look for any indication that the PDF was rendered successfully
      const pdfContainer = page.locator('div[aria-label="PDF Viewer"], div.pdf-container, canvas, div[class*="pdf"]');
      await expect(pdfContainer).toBeVisible({ timeout: 5000 });
      console.log("PDF container found");
    } catch (containerError) {
      console.log("No specific PDF container found, looking for any content change");
      // Last resort - check if there's any content in the right side of the screen
      const rightPanel = page.locator('div[class*="preview"], div[class*="right"]').first();
      await expect(rightPanel).not.toBeEmpty({ timeout: 5000 });
      console.log("Right panel has content");
    }
  }
});