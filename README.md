# QA Engineer Practical Assessment — E-commerce Checkout Flow

[![Playwright Tests](https://img.shields.io/badge/tests-playwright-blue)](https://playwright.dev)  
[![TypeScript](https://img.shields.io/badge/language-typescript-3178c6)](https://www.typescriptlang.org)  


A focused QA repository that validates a simple e-commerce checkout flow:

Login → Create Order → Payment (Card / Mobile Money) → Status = PAID → Receipt Generated

The emphasis is on risk-based test design, API-first automation, and clear trade-offs for what to automate vs. test manually.

---

## Table of Contents

- [Overview](#overview)  
- [Scope](#scope)  
  - [In scope](#in-scope)  
  - [Out of scope](#out-of-scope)  
- [Tech stack](#tech-stack)  
- [Quick start](#quick-start)  
  - [Prerequisites](#prerequisites)  
  - [Install & configure](#install--configure)  
  - [Run tests](#run-tests)  
- [Environment variables](#environment-variables)  
- [Available scripts](#available-scripts)  
- [Repository structure](#repository-structure)  
- [Test strategy (summary)](#test-strategy-summary)  
- [Authentication approach](#authentication-approach)  
- [Reporting, observability & CI recommendations](#reporting-observability--ci-recommendations)  
- [Troubleshooting](#troubleshooting)  
- [Contributing](#contributing)  
- [Contact & License](#contact--license)

---

## Overview

This project prioritizes API automation (fast, deterministic) with a minimal set of UI E2E smoke tests to validate end-to-end behavior. Tests are implemented in TypeScript using Playwright so API and UI tests can run under the same runner and reporting tools.

---

## Scope

### In scope
- User authentication and session handling  
- Order creation (items, quantities, totals)  
- Payment processing (card and mobile money)  
- Order status transitions (CREATED → PAID)  
- Receipt generation and validation  
- API contract validation and data consistency  
- Basic reliability and error handling checks

### Out of scope
- Full product catalog browsing and discovery  
- Fulfillment, shipping, and post-purchase workflows  
- Third-party payment provider certification  
- Deep security or penetration testing  
- Full UI regression coverage

---

## Tech stack

- Test runner: Playwright (API + UI capabilities)  
- Language: TypeScript  
- Environment config: dotenv (automation/config/env.local)  
- Reporting: Playwright HTML reports (reports/test-run-results/)  
- CI: Any modern CI (GitHub Actions recommended)

---

## Quick start

### Prerequisites
- Node.js (16+ recommended)  
- npm or yarn  
- A running test backend (set `API_BASE_URL` accordingly)

### Install & configure
1. Install dependencies:
```bash
npm install
```

2. Copy environment template and edit:
```bash
cp automation/config/env.example automation/config/env.local
# Edit automation/config/env.local and set required variables:
# API_BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, etc.
```

### Run tests
- Run API tests:
```bash
npm run test:api
```
- Run UI smoke tests:
```bash
npm run test:ui
```
- Run all tests:
```bash
npm run test:all
```
- Open the latest HTML report:
```bash
npm run report
```

---

## Environment variables

Place local variables in `automation/config/env.local` (gitignored). Minimum required:
```env
API_BASE_URL=https://api.example.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=supersecret
```

Optional:
- `AUTH_TOKEN` — pre-provisioned token (fallback)
- `UI_BASE_URL` — base URL for UI smoke tests

---

## Available scripts (package.json)

Example commands:
```json
{
  "test:api": "playwright test --project=api",
  "test:ui": "playwright test --project=ui",
  "test:all": "playwright test",
  "report": "playwright show-report reports/test-run-results"
}
```

Adjust script names to match your `package.json` if different.

---

## Repository structure

- automation/
  - api/
  - helpers/ — API client, auth helpers
  - tests/ — API tests (order creation, payment, receipt)
  - config/
    - env.example
    - env.local (gitignored)
  - ui/
    - tests/ — UI E2E smoke tests (planned)
    - helpers/
- test-plan/
  - test-strategy.md
  - test-cases.md
- triage/
  - flaky-test-analysis.md
- reports/
  - test-run-results/ (Playwright HTML reports)
- playwright.config.ts
- tsconfig.json
- package.json
- README.md

---

## Test strategy (summary)

- Risk-based: prioritize flows that impact revenue and user trust (authentication, payment, receipts).  
- API-first: faster feedback and higher reliability than UI-heavy suites
- Automate high-value, deterministic API scenarios first (happy path + critical negative cases).  
- Prefer API-first tests for speed and reliability; reserve UI for smoke/regression where necessary.  
- Use idempotent operations and unique test data to avoid cross-test interference.  
- Quarantine flaky tests and track them in `triage/flaky-test-analysis.md`.

---

## Authentication approach

Primary:
1. Login via API using `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` to obtain a token (preferred).

Fallback:
2. Use `AUTH_TOKEN` when interactive/MFA login prevents full automation.

Implementation: `automation/api/helpers/auth.ts`

---

## Reporting, observability & CI recommendations

- Save Playwright HTML reports under `reports/test-run-results/`.  
- Persist traces/screenshots for failures to speed triage.  
- Run API tests on every PR (fast). Run UI smoke tests on merge or nightly.  
- Do not let flaky/unstable tests block merges — quarantine and triage them.  
- Store artifacts (reports, traces) in CI for debugging.

---

## Troubleshooting

- Authentication failures: verify `API_BASE_URL`, `TEST_USER_EMAIL`, and `TEST_USER_PASSWORD`.  
- Intermittent failures: re-run with Playwright trace enabled and attach traces to issues.  
- Missing env vars: compare `automation/config/env.local` with `automation/config/env.example`.

Enable verbose Playwright logs for deeper debugging:
```bash
DEBUG=pw:api npm run test:api
```

---

## Contributing

- File issues for failing tests, missing coverage, or flaky behavior.  
- Follow the test strategy: prefer API-first, deterministic tests, and document trade-offs.  
- Update `test-plan/test-cases.md` when adding or changing tests.  
- Add tests under `automation/api/tests` (API) or `automation/ui/tests` (UI smoke).

---
