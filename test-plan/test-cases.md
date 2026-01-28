# Test Cases — E-commerce Checkout Flow (Web UI + REST APIs)

> Scope: Login → Create Order → Pay (Card/Mobile Money) → Status = **PAID** → Receipt Generated

## Legend
- **Priority:** P0 (critical), P1 (high), P2 (medium)
- **Type:** UI, API, Data
- **Automate first?** Yes = highest ROI for CI and core risk coverage

---

## Test Cases (10–15)

### TC-001 — Login succeeds with valid credentials
- **Type:** UI + API
- **Priority:** P0
- **Automate first?:** Yes (stable, prerequisite for UI E2E)
- **Preconditions:** Valid test user exists.
- **Steps:**
  1. Navigate to Login page (UI) or call auth endpoint (API).
  2. Submit valid username/password.
- **Expected Results:**
  - UI: User is redirected to authenticated area (catalog/dashboard).
  - API: Returns 200 and a valid session/token.
  - No sensitive data exposed in responses/logs.

---

### TC-002 — Login fails with invalid credentials
- **Type:** UI + API
- **Priority:** P0
- **Automate first?:** Yes (fast, prevents auth regressions)
- **Preconditions:** None.
- **Steps:**
  1. Attempt login with incorrect password.
- **Expected Results:**
  - UI shows clear error message.
  - API returns 401/403.
  - No session/token created.

---

### TC-003 — Unauthorized user cannot create an order
- **Type:** API
- **Priority:** P0
- **Automate first?:** Yes (help verify security + integrity)
- **Preconditions:** No valid auth token/session.
- **Steps:**
  1. Call `POST /orders` without auth.
- **Expected Results:**
  - 401/403 returned.
  - No order is created.

---

### TC-004 — Create order with valid items and quantities
- **Type:** API + Data
- **Priority:** P0
- **Automate first?:** Yes (core flow foundation)
- **Preconditions:** Authenticated user; test items exist.
- **Steps:**
  1. Call `POST /orders` with valid item IDs and quantities.
  2. Retrieve the created order via `GET /orders/{id}`.
- **Expected Results:**
  - 201 Created (or expected status) with `orderId`.
  - Order contains correct line items and quantities.
  - Order has expected initial status (CREATED / PENDING_PAYMENT).

---

### TC-005 — Reject order creation with invalid quantity (0 or negative)
- **Type:** API
- **Priority:** P1
- **Automate first?:** Yes (validation, low effort)
- **Preconditions:** Authenticated user; test item exists.
- **Steps:**
  1. Attempt `POST /orders` with quantity = 0.
  2. Attempt `POST /orders` with quantity = -1.
- **Expected Results:**
  - 400 Bad Request and an expected validation error.
  - Clear error payload indicating invalid quantity.
  - No order created.

---

### TC-006 — Order totals are correct (server-calculated)
- **Type:** API + Data
- **Priority:** P0
- **Automate first?:** Yes (money correctness)
- **Preconditions:** Authenticated user; known item prices in test environment (or returned in API).
- **Steps:**
  1. Create order with multiple items/quantities.
  2. Retrieve order details.
  3. Compute expected total = Σ(price × qty) from response data.
- **Expected Results:**
  - API order total matches computed total.
  - No client-controlled total overrides server total.

---

### TC-007 — Successful card payment updates order to PAID and generates receipt
- **Type:** API + Data
- **Priority:** P0
- **Automate first?:** **Yes (highest priority automation)**
- **Preconditions:** Authenticated user; created order in payable state; payment sandbox supports success simulation.
- **Steps:**
  1. Create an order.
  2. Call payment endpoint with method = CARD and valid payment payload.
  3. Poll `GET /orders/{id}` until status updates or timeout.
  4. Call `GET /orders/{id}/receipt` (or receipt endpoint).
- **Expected Results:**
  - Payment returns success (200/201).
  - Order status becomes **PAID** within acceptable time window.
  - Receipt endpoint returns receipt successfully.
  - Receipt totals and orderId match the order.

---

### TC-008 — Successful mobile money payment updates order to PAID and generates receipt
- **Type:** API + Data
- **Priority:** P0
- **Automate first?:** Yes (core flow; payment method coverage)
- **Preconditions:** Same as TC-007, mobile money success simulation available.
- **Steps:**
  1. Create an order.
  2. Pay with method = MOBILE_MONEY.
  3. Poll order status until PAID or a timeout.
  4. Retrieve receipt.
- **Expected Results:**
  - Order updates to **PAID**.
  - Receipt generated and matches order.

---

### TC-009 — Failed payment does not mark order as PAID and no receipt is generated
- **Type:** API + Data
- **Priority:** P0
- **Automate first?:** Yes (protects against false PAID states)
- **Preconditions:** Order created; payment sandbox supports failure simulation like insufficient funds.
- **Steps:**
  1. Create an order.
  2. Attempt payment without funds.
  3. Retrieve order status.
  4. Attempt to retrieve receipt.
- **Expected Results:**
  - Payment returns failure 400s.
  - Order status remains NOT PAID/CREATED/PENDING_PAYMENT/FAILED_PAYMENT.
  - Receipt endpoint returns 404/409/403 or indicates not available.

---

### TC-010 — Payment idempotency: retrying the same payment does not create duplicates
- **Type:** API + Data
- **Priority:** P0
- **Automate first?:** Yes (high-risk real-world issue)
- **Preconditions:** Order created; API supports idempotency key or equivalent.
- **Steps:**
  1. Create an order.
  2. Submit payment request with an idempotency key.
  3. Re-submit the same payment request with the same idempotency key.
  4. Retrieve payment/transaction list for the order.
- **Expected Results:**
  - Second request does not create an additional charge/transaction.
  - Order remains **PAID** with exactly one successful payment.
  - Receipt remains single.

---

### TC-011 — Prevent double payment: paying an already PAID order is rejected or safely handled
- **Type:** API
- **Priority:** P0
- **Automate first?:** Yes (core money integrity)
- **Preconditions:** Order is already **PAID**.
- **Steps:**
  1. Create and successfully pay an order (reach PAID).
  2. Attempt to pay the same order again.
- **Expected Results:**
  - API rejects with 409 Conflict/returns idempotent success without charging again.
  - No additional payment is recorded.
  - Receipt remains unchanged.

---

### TC-012 — Receipt content validation matches order details (items, quantities, totals)
- **Type:** API + Data
- **Priority:** P1
- **Automate first?:** Yes (high value)
- **Preconditions:** Order is **PAID** and receipt exists.
- **Steps:**
  1. Retrieve paid order details.
  2. Retrieve receipt.
  3. Compare: orderId, line items, quantities, totals.
- **Expected Results:**
  - Receipt matches order exactly for core fields.
  - No missing/extra line items.
  - Total and currency consistent.

---

### TC-013 — UI E2E smoke: user completes checkout and sees confirmation
- **Type:** UI
- **Priority:** P0
- **Automate first?:** Yes
- **Preconditions:** Valid user; at least one purchasable item visible in UI; payment success simulation available.
- **Steps:**
  1. Login via UI.
  2. Add item with quantity to cart/order.
  3. Checkout and pay using card or mobile money.
  4. Observe confirmation page / order detail page.
- **Expected Results:**
  - UI shows success confirmation.
  - Order displayed as **PAID**.
  - Receipt link/button visible.

---

### TC-014 — UI negative: invalid login shows error and user stays unauthenticated
- **Type:** UI
- **Priority:** P1
- **Automate first?:** Optional (not necessary because TC-002 covers API)
- **Preconditions:** None.
- **Steps:**
  1. Attempt login with invalid credentials.
- **Expected Results:**
  - Clear error message.
  - User remains on login page.
  - No authenticated access.

---

### TC-015 — Session/token expiry during checkout blocks payment safely
- **Type:** API (and optional UI)
- **Priority:** P1
- **Automate first?:** Optional (depends on environment support)
- **Preconditions:** Ability to simulate expired token/session.
- **Steps:**
  1. Authenticate and create an order.
  2. Expire/invalid token/session.
  3. Attempt payment.
- **Expected Results:**
  - Payment request rejected with 401/403.
  - Order is not marked **PAID**.
  - No receipt generated.

---

## Automation Recommendation Summary (What to automate first and why)
1. **TC-007 (Card payment happy path)** — highest business risk + validates end-to-end state + receipt
2. **TC-009 (Payment failure)** — prevents false PAID, protects integrity
3. **TC-010 (Idempotency)** — protects against double-charge, common real-world defect
4. **TC-004 + TC-006 (Order creation + totals)** — foundational correctness for payments
5. **TC-013 (UI E2E smoke)** — minimal UI coverage to validate integration without flakiness
