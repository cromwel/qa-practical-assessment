# QA Engineer Practical Assessment — E-commerce Checkout Flow

This repository contains QA documentation and automation for a simple e-commerce checkout flow:

**Login → Create Order → Payment (Card / Mobile Money) → Status = PAID → Receipt Generated**

The focus of this assessment is **risk-based test design**, **API-first automation**, and **clear reasoning around quality trade-offs**, rather than exhaustive feature coverage.

---

## Scope of Testing

### In Scope
- User authentication and session handling
- Order creation (items, quantities, totals)
- Payment processing (card and mobile money)
- Order status transitions (e.g. CREATED → PAID)
- Receipt generation and validation
- API contract validation and data consistency
- Basic non-functional considerations (reliability, error handling)

### Out of Scope
- Full catalog browsing and discovery
- Fulfillment, shipping, and post-purchase workflows
- Third-party payment provider certification
- Deep security or penetration testing
- Full UI regression coverage

---

## Tech Stack

- **Test Framework:** Playwright
- **Language:** TypeScript
- **Test Types:**
  - API automation (primary)
  - UI automation (minimal E2E smoke)
- **Configuration:** dotenv (`env.local`)
- **Reporting:** Playwright HTML reports

The stack was chosen to support **API and UI testing within a single framework**, with strong type safety for payment and order flows.

---

## Repository Structure

automation/
api/
helpers/ # API client and authentication helpers
tests/ # API tests (order creation, payment, receipt)
ui/
tests/ # UI E2E smoke tests (planned)
config/
env.example # Environment variable template
env.local # Local env (ignored by git)

test-plan/
test-strategy.md # Risk-based test strategy
test-cases.md # 10–15 high-quality test cases

triage/
flaky-test-analysis.md # Flaky test investigation approach (planned)

reports/
test-run-results/ # Playwright test reports

playwright.config.ts
tsconfig.json
package.json
README.md


---

## Test Strategy & Test Cases

- **Test Strategy:** `test-plan/test-strategy.md`  
  Defines quality goals, risks, test approach, automation priorities, and trade-offs.

- **Test Cases:** `test-plan/test-cases.md`  
  Contains 15 risk-based test cases covering:
  - Happy paths
  - Negative scenarios
  - Edge cases
  - API-focused validation
  - Data integrity checks  
  Each test case indicates whether it should be automated and why.

---

## Authentication Approach

API tests authenticate using the following priority:

1. **Login via API (preferred)**  
   Uses `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` to obtain a token dynamically.  
   This makes tests self-contained and reproducible in CI environments.

2. **Pre-provisioned token (fallback)**  
   If automated login is not possible (e.g. SSO/MFA), tests can use `AUTH_TOKEN`.

This logic is implemented in:
automation/api/helpers/auth.ts

---

## Environment Setup

### 1. Install dependencies
```bash
npm install

### Configure environment variables
cp automation/config/env.example automation/config/env.local

Populate env.local with:
API_BASE_URL
TEST_USER_EMAIL
TEST_USER_PASSWORD

Optional fallback:
AUTH_TOKEN

For UI tests:
UI_BASE_URL
env.local is ignored by Git and must not be committed.

Running Tests
Run API tests
npm run test:api

Run UI tests
npm run test:ui

Run all tests
npm run test:all

View HTML report
npm run report

Reports are generated under:
reports/test-run-results/

##Automation Approach
API Automation (Primary)
Validates order creation, payment, PAID status, and receipt generation
Covers idempotency and retry safety
Optimized for speed, determinism, and CI execution

UI Automation (Minimal)
