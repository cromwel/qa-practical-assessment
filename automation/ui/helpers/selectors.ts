export const selectors = {
    login: {
      email: '[data-testid="email"]',
      password: '[data-testid="password"]',
      submit: '[data-testid="login-submit"]'
    },
    checkout: {
      addItem: '[data-testid="add-item"]',
      quantity: '[data-testid="quantity"]',
      checkoutButton: '[data-testid="checkout"]',
      payButton: '[data-testid="pay"]',
      successMessage: '[data-testid="payment-success"]',
      orderStatus: '[data-testid="order-status"]',
      receiptLink: '[data-testid="receipt-link"]'
    }
  };
  