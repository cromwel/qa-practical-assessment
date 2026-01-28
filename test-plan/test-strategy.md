# Test Strategy — E-commerce Checkout Flow (Web UI + REST APIs + SQL DB)

## 1. Purpose and Goals
This test strategy defines the approach for validating quality of the checkout flow described in the assessment:

1. User logs in
2. User creates an order (items, quantities)
3. User makes a payment (card or mobile money)
4. Order status updates to **PAID**
5. Receipt is generated

> Note: Signup and catalog browsing are usually part of typical e-commerce capabilities but are not the primary focus of this assessment, i'll skip this for now.

### Primary Quality Goals

#### A. General E-commerce Quality Goals (Full-Scale Platform)
- Correctness of core journeys (auth, cart/order, payment, confirmation)
- Accurate pricing/totals (discounts/tax/shipping where applicable)
- Payment integrity (no double charge, safe retries/refunds/cancellations)
- Consistent order state across UI/API/DB
- Security & privacy (authz enforced, sensitive data protected)
- Reliability & performance (resilience, acceptable response times)
- Observability (traceable transactions, actionable logs)

#### B. Specific Goals for This Assessment Scenario
- Validate the end-to-end flow: login → create order → pay → PAID → receipt
- Ensure payment and order status accuracy (success vs failure paths)
- Prevent duplicates (idempotent payment behavior; safe retries)
- Validate receipt generation and correctness (only for PAID; totals match order)
- Prioritize automation that is stable and CI-suitable (API-first, minimal UI smoke)


---

## 2. Scope

### In Scope
- User authentication and session handling
- Order creation and validation (items, quantities, totals)
- Payment processing (card and mobile money)
- Order status lifecycle and state transitions
- Receipt generation and retrieval
- API contract validation and data consistency
- Basic non-functional checks (reliability, error handling)

### Out of Scope
- Full UI/UX review beyond critical usability issues
- Payment provider certification or third-party gateway testing
- Deep security or penetration testing
- Fulfillment, shipping, or post-purchase workflows

---

## 3. Assumptions and Test Data

### Assumptions
- Test user credentials are available
- REST APIs exist for authentication, order creation, payment, order status, and receipt retrieval
- Payments can be simulated via a sandbox or mock provider
- SQL database is the system of record, but direct DB access may not be available

### Test Data Strategy
- Use deterministic test data (known items, prices, and users)
- Generate unique order references per test run
- Isolate test data to avoid conflicts in shared environments
- Perform cleanup where supported, otherwise rely on unique identifiers

---

## 4. Risk-Based Quality Assessment

### 4.1 Quality Signals & Key Assertions

This section defines the observable signals used to determine whether the system is behaving correctly. These assertions guide both manual and automated testing.

#### Authentication & Session
- Authenticated users receive valid session or token credentials
- Unauthorized users cannot create orders or initiate payments
- Session remains valid throughout the checkout flow

#### Order Creation
- Order total equals the sum of item prices multiplied by quantities
- Orders cannot be created with invalid quantities (zero, negative, excessive)
- Each order is created with a unique identifier

#### Payment Processing
- Successful payment creates exactly one payment record per order
- Failed payments do not update order status to **PAID**
- Payment amount matches the order total
- Payment retries do not create duplicate charges

#### Order Status & Consistency
- Order status transitions follow a valid lifecycle (e.g. CREATED → PAID)
- Order status is consistent across UI and API responses
- Status changes are reflected within an acceptable time window

#### Receipt Generation
- Receipts are generated only for successfully paid orders
- Receipt details (items, quantities, totals, order ID) match the order
- Each order has at most one receipt

---

### 4.2 Risk-to-Test Coverage Mapping

This section maps key quality risks to targeted test coverage.

#### High-Risk Areas and Coverage
- **Incorrect or duplicate payment**
  - API tests validating idempotent payment behavior
  - Payment retry scenarios
  - Concurrency checks for multiple payment attempts

- **Order status inconsistency**
  - API assertions after payment
  - UI validation of final order state
  - Receipt availability checks tied to order status

- **Missing or incorrect receipt**
  - Receipt generation tests after successful payment
  - Receipt content validation against order data
  - Negative tests ensuring receipts are unavailable for unpaid orders

- **Session expiry during checkout**
  - Token and session validation during order creation and payment
  - Negative tests for expired or invalid sessions

#### Medium-Risk Areas and Coverage
- Edge value tests for item quantities and totals
- Network or timeout simulation during payment
- API error handling and response validation

#### Low-Risk Areas and Coverage
- Minimal UI smoke validation
- Visual or formatting checks only when they impact usability or correctness


---

## 5. Test Approach

### 5.1 Test Levels
- **API Testing (Primary):** Validate business rules, state transitions, and data integrity
- **UI Testing (Selective):** Cover critical end-to-end user journeys
- **Data Validation:** Verify correctness via APIs and inferred database behavior
- **Exploratory Testing:** Focus on edge cases and failure scenarios

### 5.2 Functional Coverage Areas

#### Authentication
- Successful login with valid credentials
- Error handling for invalid credentials
- Session/token behavior during checkout

#### Order Creation
- Create order with valid items and quantities
- Reject invalid quantities (zero, negative, excessive)
- Verify calculated totals and line items

#### Payment
- Successful card payment updates order to PAID
- Successful mobile money payment updates order to PAID
- Failed payment does not update order status
- Payment retry does not cause duplicate charges or receipts

#### Order Status and Receipt
- Order status updates correctly after payment
- Receipt is generated only for PAID orders
- Receipt content matches order data (items, totals, order ID)

---

## 6. Non-Functional Considerations
- **Reliability:** Repeat critical flows to detect flakiness
- **Performance:** Validate acceptable response times for key APIs
- **Security (Basic):** Ensure authentication is enforced and sensitive data is not exposed

---

## 7. Test Environment
- Staging or test environment with Web UI and API access
- Payment sandbox or mock gateway
- Test credentials and sample catalog items
- Environment configuration managed via environment variables

If the environment is shared:
- Use isolated test data
- Avoid assumptions about existing state

---

## 8. Entry and Exit Criteria

### Entry Criteria
- Application endpoints are reachable
- Test credentials are available
- Required test data exists or can be created

### Exit Criteria
- Risk-based test strategy documented
- 10–15 high-quality test cases written
- At least one UI end-to-end automated test implemented
- At least one API automated test implemented
- Flaky test investigation approach documented

---

## 9. Automation Strategy and Prioritization

### Automation Priorities
1. API happy path: create order → pay → verify PAID → verify receipt
2. API negative and idempotency scenarios
3. UI end-to-end checkout smoke test

### Rationale
- API tests provide fast, stable feedback and validate core business logic
- UI tests are limited to critical paths to reduce flakiness and maintenance cost

### Automation Principles
- No hard-coded waits
- Stable and meaningful selectors
- Reusable helpers and test data
- Clear assertions and readable test structure
- Capture artifacts on failure (screenshots, logs)

---

## 10. Defect Management and Triage
- Defects documented with clear reproduction steps and evidence
- Severity classification:
  - **Critical:** Double charge, incorrect PAID status, missing receipt
  - **High:** Payment failure, incorrect totals
  - **Medium/Low:** UI or formatting issues

---

## 11. CI and Flaky Test Handling
- API tests executed on every pull request
- UI smoke tests run on PRs and/or nightly
- Capture logs, screenshots, and videos on failure
- Investigate flaky tests promptly and quarantine if necessary

---

## 12. Open Questions and Clarifications
- Web UI base URL and supported browsers
- API base URL and authentication mechanism
- Test user credentials and roles
- Payment sandbox behavior for success and failure cases
- Receipt format and access method
- Whether direct database access is expected or allowed
