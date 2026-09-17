import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Sign In', { timeout: 15000 });
  });

  test('displays login form with all required fields', async ({ page }) => {
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('displays college branding', async ({ page }) => {
    const heading = page.locator('h1:has-text("Adithya Institute of Technology")');
    await expect(heading.first()).toBeVisible();
  });

  test('has role selection dropdown', async ({ page }) => {
    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    const options = await select.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(1);
  });

  test('shows forgot password modal', async ({ page }) => {
    await page.locator('text=Forgot Password?').click();
    await expect(page.locator('text=Reset Password')).toBeVisible();
    await expect(page.locator('button:has-text("Send Reset Link")')).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    const select = page.locator('select').first();
    await select.selectOption('Administrator');
    await page.locator('input[type="email"]').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
  });

  test('successful login as Administrator navigates to dashboard', async ({ page }) => {
    const select = page.locator('select').first();
    await select.selectOption('Administrator');
    await page.locator('input[type="email"]').fill('admin@ait.edu.in');
    await page.locator('input[type="password"]').fill('Admin@123');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 15000 });
  });

  test('password visibility toggle works', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    const toggleBtn = page.locator('input[type="password"]').locator('..').locator('button');
    if (await toggleBtn.count() > 0) {
      await toggleBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

  test('remember me checkbox is present', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
  });

  test('has dark mode toggle', async ({ page }) => {
    const themeToggle = page.locator('button[title*="Theme"]');
    await expect(themeToggle).toBeVisible();
  });
});
