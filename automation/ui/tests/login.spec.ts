import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';
import { testUser } from '../helpers/test-data';

test('UI: user can log in successfully', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  const email = page.locator(selectors.login.email);
  const password = page.locator(selectors.login.password);
  const submit = page.locator(selectors.login.submit);

  await expect(email).toBeVisible();

  await email.fill(testUser.email);
  await password.fill(testUser.password);

  await submit.click();

  // Wait for post-login route (more reliable than networkidle)
  await expect(page).toHaveURL(/dashboard|home|catalog/, { timeout: 10_000 });

});
