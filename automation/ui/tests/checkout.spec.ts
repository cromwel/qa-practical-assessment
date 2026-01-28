import { test, expect } from '@playwright/test';
import { selectors } from '../helpers/selectors';
import { testUser } from '../helpers/test-data';

test.describe('UI: checkout E2E smoke', () => {
  test('user can complete checkout and see PAID status', async ({ page }) => {
    // Login
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    console.log('URL after goto:', page.url());
    console.log('Title:', await page.title());
    await page.screenshot({ path: 'debug-login.png', fullPage: true });

    const email = page.locator(selectors.login.email);
    const password = page.locator(selectors.login.password);
    const submit = page.locator(selectors.login.submit);

    await expect(email).toBeVisible();
    await email.fill(testUser.email);
    await password.fill(testUser.password);

    await submit.click();

    // Prefer an explicit post-login signal over networkidle
    await expect(page).not.toHaveURL(/\/login/i, { timeout: 10_000 });
    // If your app does not change URL on login, keep the old check but consider adding a logged-in testid:
    // await expect(submit).toBeHidden({ timeout: 10_000 });

    // Add item and checkout
    const addItem = page.locator(selectors.checkout.addItem);
    const quantity = page.locator(selectors.checkout.quantity);
    const checkoutButton = page.locator(selectors.checkout.checkoutButton);

    await expect(addItem).toBeVisible();
    await addItem.click();

    await expect(quantity).toBeVisible();
    await quantity.fill('2');
    await quantity.blur(); // helps UIs that commit on blur

    await expect(checkoutButton).toBeEnabled();
    await checkoutButton.click();

    // Pay (payment processing may be async)
    const payButton = page.locator(selectors.checkout.payButton);
    await expect(payButton).toBeEnabled();
    await payButton.click();

    // Assert success with timeouts that reflect async payment
    const successMessage = page.locator(selectors.checkout.successMessage);
    const orderStatus = page.locator(selectors.checkout.orderStatus);

    await expect(successMessage).toBeVisible({ timeout: 20_000 });
    await expect(orderStatus).toHaveText(/PAID/i, { timeout: 20_000 });

    // Receipt link visible
    const receiptLink = page.locator(selectors.checkout.receiptLink);
    await expect(receiptLink).toBeVisible({ timeout: 10_000 });
  });
});
