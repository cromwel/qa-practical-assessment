import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';
import { testUser } from '../helpers/test-data';

test('UI: user can log in successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill(selectors.login.email, testUser.email);
  await page.fill(selectors.login.password, testUser.password);
  await page.click(selectors.login.submit);
  await expect(page).toHaveURL(/dashboard|home|catalog/);
});
