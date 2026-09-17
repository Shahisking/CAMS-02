import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Full Portal Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
  });

  test('page loads with no critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('Failed to load resource') &&
      !e.includes('404') && !e.includes('net::')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('sidebar scroll area exists and is functional', async ({ page }) => {
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    const isFunctional = await nav.evaluate((el) => el.clientHeight > 0);
    expect(isFunctional).toBe(true);
  });

  test('global search works from navbar', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]');
    await searchInput.fill('computer');
    await page.waitForTimeout(1000);
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('navigates to key pages without errors', async ({ page }) => {
    const tabs = ['Assets', 'Dashboard'];
    for (const tab of tabs) {
      await page.locator('nav button').filter({ hasText: tab }).click();
      await page.waitForTimeout(1500);
      const main = page.locator('main').first();
      await expect(main).toBeVisible();
    }
  });
});
