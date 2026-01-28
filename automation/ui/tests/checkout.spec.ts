import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';
import { testUser } from '../helpers/test-data';

test.describe('UI: checkout E2E smoke', () => {
  test('user can complete checkout and see PAID status', async ({ page }) => {
    // Login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page.locator(selectors.login.email)).toBeVisible();
    await page.fill(selectors.login.email, testUser.email);
    await page.fill(selectors.login.password, testUser.password);

    // Click and wait for a logged-in signal
    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.click(selectors.login.submit)
    ]);

    // assert a post-login element 
    await expect(page.locator(selectors.login.submit)).toBeHidden({ timeout: 10_000 });

    // Add item and checkout
    await expect(page.locator(selectors.checkout.addItem)).toBeVisible();
    await page.click(selectors.checkout.addItem);

    await expect(page.locator(selectors.checkout.quantity)).toBeVisible();
    await page.fill(selectors.checkout.quantity, '2');

    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.click(selectors.checkout.checkoutButton)
    ]);

    // Pay (payment processing may be async)
    await expect(page.locator(selectors.checkout.payButton)).toBeEnabled();
    await page.click(selectors.checkout.payButton);

    // Assert success with timeouts that reflect async payment 
    await expect(page.locator(selectors.checkout.successMessage)).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(selectors.checkout.orderStatus)).toHaveText(/PAID/i, { timeout: 20_000 });

    // Receipt link visible 
    await expect(page.locator(selectors.checkout.receiptLink)).toBeVisible({ timeout: 10_000 });
  });
});
