import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Wait for login page to render
  await page.waitForSelector('text=Sign In', { timeout: 15000 });

  // Select Administrator role
  const roleSelect = page.locator('select').first();
  await roleSelect.selectOption('Administrator');

  // Fill email
  await page.locator('input[type="email"]').fill('admin@ait.edu.in');

  // Fill password
  await page.locator('input[type="password"]').fill('Admin@123');

  // Click Sign In
  await page.locator('button[type="submit"]').click();

  // Wait for dashboard to load (sidebar should appear)
  await page.waitForSelector('text=Dashboard', { timeout: 15000 });

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
