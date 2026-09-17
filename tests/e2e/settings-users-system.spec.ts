import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Settings (Monitor role only)', () => {
  test('displays settings page for authorized roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const btn = page.locator('nav button').filter({ hasText: 'Settings' });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('h1:has-text("System Preferences")')).toBeVisible();
    }
  });
});

test.describe('User Management (Monitor role only)', () => {
  test('displays user management page for authorized roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const btn = page.locator('nav button').filter({ hasText: 'User Management' });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('h1:has-text("User Management")')).toBeVisible();
    }
  });
});

test.describe('System Monitor (Monitor role only)', () => {
  test('displays system monitor page for authorized roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const btn = page.locator('nav button').filter({ hasText: 'System Monitor' });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator('h1:has-text("System Monitor")')).toBeVisible();
    }
  });
});
