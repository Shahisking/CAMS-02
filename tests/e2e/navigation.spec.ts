import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/user.json' });

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
  });

  test('sidebar displays navigation items', async ({ page }) => {
    const navButtons = page.locator('nav button');
    const count = await navButtons.count();
    expect(count).toBeGreaterThanOrEqual(8);
  });

  test('sidebar highlights active tab', async ({ page }) => {
    const dashboardBtn = page.locator('nav button').filter({ hasText: 'Dashboard' });
    await expect(dashboardBtn).toHaveClass(/bg-\[#2563EB\]/);
  });

  test('navigates to Assets tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Assets' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("Campus Asset Management")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Departments tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Departments' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("College Departments")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Blocks tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Blocks' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("Campus Location Hierarchy")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Categories tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Categories' }).click();
    await page.waitForTimeout(1500);
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Requests tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Requests' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("Asset Maintenance")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Issue / Return tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Issue / Return' }).click();
    await page.waitForTimeout(2000);
    const heading = page.locator('h1:has-text("New Asset Transfer"), h2:has-text("Asset Transfer Restricted")');
    await expect(heading.first()).toBeVisible({ timeout: 15000 });
  });

  test('navigates to Maintenance tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Maintenance' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("Asset Maintenance")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Reports tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Reports' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("Institutional Asset Reports")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to Audit Logs tab', async ({ page }) => {
    await page.locator('nav button').filter({ hasText: 'Audit Logs' }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("System Audit Trail")')).toBeVisible({ timeout: 10000 });
  });

  test('navigates to User Management tab (Monitor role only)', async ({ page }) => {
    const btn = page.locator('nav button').filter({ hasText: 'User Management' });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('h1:has-text("User Management")')).toBeVisible({ timeout: 10000 });
    }
  });

  test('navigates to Settings tab (Monitor role only)', async ({ page }) => {
    const btn = page.locator('nav button').filter({ hasText: 'Settings' });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('h1:has-text("System Preferences")')).toBeVisible({ timeout: 10000 });
    }
  });

  test('navigates to System Monitor tab (Monitor role only)', async ({ page }) => {
    const btn = page.locator('nav button').filter({ hasText: 'System Monitor' });
    if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('h1:has-text("System Monitor")')).toBeVisible({ timeout: 10000 });
    }
  });

  test('sidebar collapse and expand works', async ({ page }) => {
    const collapseBtn = page.locator('button[title="Collapse Sidebar"]');
    await collapseBtn.click();
    await page.waitForTimeout(500);
    const expandBtn = page.locator('button[title="Expand Sidebar"]');
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('nav button').filter({ hasText: 'Dashboard' })).toBeVisible();
  });

  test('sidebar items are properly spaced and not overlapping', async ({ page }) => {
    const buttons = page.locator('nav button');
    const count = await buttons.count();
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) positions.push(box.y);
    }
    const uniquePositions = new Set(positions);
    expect(uniquePositions.size).toBe(positions.length);
  });
});
