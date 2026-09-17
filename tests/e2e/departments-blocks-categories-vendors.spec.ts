import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Departments', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Dashboard', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Departments' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays departments page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("College Departments")')).toBeVisible();
  });

  test('displays department data', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});

test.describe('Blocks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Dashboard', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Blocks' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays blocks page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("Campus Location Hierarchy")')).toBeVisible();
  });

  test('displays block data', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});

test.describe('Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Dashboard', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Categories' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays categories page heading', async ({ page }) => {
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toMatch(/Category|Chair/);
  });

  test('displays category data', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});
