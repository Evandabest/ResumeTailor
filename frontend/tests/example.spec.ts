import { test, expect } from '@playwright/test';

test('hello world test', async ({ page }: { page: import('@playwright/test').Page }) => {
    await page.goto('https://example.com');
    const title = await page.title();
    expect(title).toBe('Example Domain');
});