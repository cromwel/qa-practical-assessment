import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';
import { testUser } from '../helpers/test-data';

test.describe('UI: checkout E2E smoke', () => {
  test('user can complete checkout and see PAID status', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill(selectors.login.email, testUser.email);
    await page.fill(selectors.login.password, testUser.password);
    await page.click(selectors.login.submit);

    // Assert user is logged in
    await expect(page).toHaveURL(/dashboard|home|catalog/);

    //Add item and checkout
    await page.click(selectors.checkout.addItem);
    await page.fill(selectors.checkout.quantity, '2');
    await page.click(selectors.checkout.checkoutButton);

    //Pay
    await page.click(selectors.checkout.payButton);

    // Assert success
    await expect(page.locator(selectors.checkout.successMessage)).toBeVisible();
    await expect(page.locator(selectors.checkout.orderStatus)).toHaveText(/PAID/i);

    //receipt link visible
    await expect(page.locator(selectors.checkout.receiptLink)).toBeVisible();
  });
});
