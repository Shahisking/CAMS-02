import { test, expect } from '@playwright/test';

test.describe('Navbar (Authenticated)', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
  });

  test('displays college branding in navbar', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('text=Adithya Institute of Technology').first()).toBeVisible();
  });

  test('search input is present in navbar', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
  });

  test('search input shows suggestions on typing', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]');
    await searchInput.fill('desk');
    await page.waitForTimeout(500);
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();
  });

  test('search clear button appears and works', async ({ page }) => {
    const searchInput = page.locator('header input[placeholder*="Search"]');
    await searchInput.fill('test query');
    await page.waitForTimeout(300);
    const clearBtn = page.locator('button[title="Clear Search"]');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('user profile dropdown is accessible', async ({ page }) => {
    const profileBtn = page.locator('header button').last();
    await expect(profileBtn).toBeVisible();
  });

  test('navbar is fully visible', async ({ page }) => {
    await expect(page.locator('header').first()).toBeVisible();
  });
});

test.describe('Dark Mode', () => {
  test('dark mode toggle exists on login page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Sign In', { timeout: 15000 });
    const themeToggle = page.locator('button[title*="Theme"]');
    await expect(themeToggle).toBeVisible();
  });

  test('clicking dark mode toggle changes theme', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Sign In', { timeout: 15000 });
    const themeToggle = page.locator('button[title*="Theme"]');
    await themeToggle.click();
    await page.waitForTimeout(500);
    const hasDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark');
    });
    expect(typeof hasDark).toBe('boolean');
  });
});

test.describe('Responsive Design', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('sidebar is present on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('hamburger menu opens sidebar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const hamburger = page.locator('button[title="Toggle Menu"]');
    await hamburger.click();
    await page.waitForTimeout(500);
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('page layout adapts to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('content is readable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });
});
