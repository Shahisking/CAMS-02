import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Maintenance / Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Maintenance' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays maintenance page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("Asset Maintenance")')).toBeVisible();
  });

  test('displays maintenance content', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});

test.describe('Allocation / Issue-Return', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Issue / Return' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays allocation page content', async ({ page }) => {
    const heading = page.locator('h1:has-text("New Asset Transfer"), h2:has-text("Asset Transfer Restricted")');
    await expect(heading.first()).toBeVisible({ timeout: 15000 });
  });

  test('displays allocation content', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Reports' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays reports page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("Institutional Asset Reports")')).toBeVisible();
  });

  test('displays report content', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});

test.describe('Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await page.locator('nav button').filter({ hasText: 'Audit Logs' }).click();
    await page.waitForTimeout(2000);
  });

  test('displays audit logs page heading', async ({ page }) => {
    await expect(page.locator('h1:has-text("System Audit Trail")')).toBeVisible();
  });

  test('displays audit log entries', async ({ page }) => {
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});
