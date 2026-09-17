import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
  });

  test('displays dashboard heading and subtitle', async ({ page }) => {
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Overview of college assets and operations')).toBeVisible();
  });

  test('displays stat cards section with grid layout', async ({ page }) => {
    const statCards = page.locator('text=Total Assets');
    await expect(statCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('displays Asset Status Overview chart section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Asset Status Overview")')).toBeVisible();
  });

  test('displays Assets by Category chart section', async ({ page }) => {
    await expect(page.locator('h2:has-text("Assets by Category")')).toBeVisible();
  });

  test('displays Recent Asset Requests table', async ({ page }) => {
    await expect(page.locator('h2:has-text("Recent Asset Requests")')).toBeVisible();
  });

  test('displays Recent Maintenance table', async ({ page }) => {
    await expect(page.locator('h2:has-text("Recent Maintenance")')).toBeVisible();
  });

  test('View Assets link is present', async ({ page }) => {
    await expect(page.locator('button:has-text("View Assets")')).toBeVisible();
  });

  test('All Categories link is present', async ({ page }) => {
    await expect(page.locator('button:has-text("All Categories")')).toBeVisible();
  });

  test('dashboard page loads and is interactive', async ({ page }) => {
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
    const text = await main.textContent();
    expect(text?.length).toBeGreaterThan(50);
  });
});
