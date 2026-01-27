import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage with URL input', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="url-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shorten-button"]')).toBeVisible();
  });

  test('should shorten URL and display result', async ({ page }) => {
    await page.goto('/');

    await page.fill('[data-testid="url-input"]', 'https://example.com/long-url');
    await page.click('[data-testid="shorten-button"]');

    await expect(page.locator('[data-testid="result-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="short-url"]')).toBeVisible();
  });

  test('should copy short URL to clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    await page.fill('[data-testid="url-input"]', 'https://example.com/test');
    await page.click('[data-testid="shorten-button"]');

    await expect(page.locator('[data-testid="result-card"]')).toBeVisible();
    await page.click('[data-testid="copy-button"]');

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('http');
  });

  test('should show error for invalid URL', async ({ page }) => {
    await page.goto('/');

    await page.fill('[data-testid="url-input"]', 'not-a-valid-url');
    await page.click('[data-testid="shorten-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
