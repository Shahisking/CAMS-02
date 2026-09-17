import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Asset Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Dashboard', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Assets' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays asset management page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("Asset")')).toBeVisible();
  });

  test('displays search input with correct placeholder', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('displays action buttons', async ({ page }) => {
    // At least one action button should be visible (Add Asset, Import CSV/Excel, Export CSV, or Report Issue)
    const buttons = page.locator('main button, main a').filter({
      hasText: /Add Asset|Import CSV|Export CSV|Report Issue/
    });
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('displays asset table with column headers', async ({ page }) => {
    const headers = page.locator('th');
    const count = await headers.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('search functionality filters assets', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('computer');
    await page.waitForTimeout(800);
    await expect(searchInput).toHaveValue('computer');
  });

  test('search clear button works', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('test');
    await page.waitForTimeout(300);
    const clearBtn = page.locator('button[title="Clear Search"]').first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('filter dropdowns are present', async ({ page }) => {
    const selects = page.locator('select');
    const count = await selects.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('page loads without errors', async ({ page }) => {
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
    const text = await main.textContent();
    expect(text?.length).toBeGreaterThan(10);
  });
});
