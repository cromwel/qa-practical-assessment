# QA Engineer Practical Assessment — E-commerce Checkout Flow

[![Playwright Tests](https://img.shields.io/badge/tests-playwright-blue)](https://playwright.dev)  
[![TypeScript](https://img.shields.io/badge/language-typescript-3178c6)](https://www.typescriptlang.org)  


A focused test suite that validates a simple e-commerce checkout flow from authentication to receipt generation:

Login → Create Order → Payment (Card / Mobile Money) → Status = PAID → Receipt Generated

This repository emphasizes risk-based test design, API-first automation for speed and reliability, and a small set of UI smoke tests for end-to-end confidence.

---

Contents
- Overview
- Key features
- Tech stack
- Quick start
  - Prerequisites
  - Install & configure
  - Run tests
- Environment variables
- Scripts
- Repo layout
- Test strategy (summary)
- Authentication approach
- CI & reporting guidance
- Troubleshooting
- Contributing
- Contact & License

---

## Overview

This project demonstrates an API-first testing approach using Playwright in TypeScript. API tests exercise the critical, deterministic checkout paths (order creation, payment processing, status transitions and receipt verification). UI E2E tests are intentionally limited to smoke/regression checks to validate the end-to-end flow and surface integration issues.

Aim: fast, reliable tests that provide quick feedback on high-risk, revenue-impacting functionality.

---

## Key features

- API-first test coverage for happy paths and critical negative cases
- Minimal UI smoke tests for end-to-end verification
- Playwright HTML reports with traces/screenshots for failures
- Environment-driven configuration for running tests against different environments
- Guidance for CI (GitHub Actions recommended) and artifact persistence

---

## Tech stack

- Test runner: Playwright (API + UI)
- Language: TypeScript
- Env config: dotenv (automation/config/env.local)
- Reporting: Playwright HTML reports (reports/test-run-results/)
- CI: GitHub Actions

---

## Quick start

### Prerequisites
- Node.js v16+ (LTS recommended)
- npm or yarn


### Install
```bash
npm install
npm init -y
npm i -D @playwright/test typescript ts-node dotenv
npx playwright install

```

### Configure environment
Copy the env template and set required variables:
```bash
cp automation/config/env.example automation/config/env.local
# Edit automation/config/env.local and set:
# UI_BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, USE_FAKE_AUTH=true.
```

Minimum required in automation/config/env.local:
```env
API_BASE_URL=https://api.example.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=supersecret
# Optional:
# AUTH_TOKEN=eyJ...   # when you want to inject a pre-provisioned token
# UI_BASE_URL=https://app.example.test
```

### Run tests
- Run API tests (fast):
```bash
npm run test:api
```
- Run UI smoke tests:
```bash
npm run test:ui
```
- Run the full suite:
```bash
npm run test:all
```
- Open the latest HTML report:
```bash
npm run report
# or
npx playwright show-report reports/test-run-results
```

Run a single API test file:
```bash
npx playwright test automation/api/tests/my-test.spec.ts --project=api
```

Run with verbose Playwright API logs:
```bash
DEBUG=pw:api npm run test:api
```

---

## Environment variables (summary)

Place local variables in `automation/config/env.local` (this file is gitignored). Example variables:

- UI_BASE_URL (required) — base URL for UI smoke tests
- TEST_USER_EMAIL (required) — test account email
- TEST_USER_PASSWORD (required) — test account password
- AUTH_TOKEN (optional/mocked instead) — pre-provisioned token (fallback)
- API_BASE_URL (optional/mocked instead) — base URL for API tests


---

## Available scripts (package.json)

Example scripts — ensure these match your package.json:
```json
{
  "test:api": "playwright test --project=api",
  "test:ui": "playwright test --project=ui",
  "test:all": "playwright test",
  "report": "playwright show-report reports/test-run-results"
}
```

---

## Repository structure

- automation/
  - api/                - API
    - helpers/            
    - tests/              
  - ui/                 — UI
    - helpers/            
    - tests/
    - mock-app/             
- test-plan/
  - test-strategy.md
  - test-cases.md
- triage/
  - flaky-test-analysis.md
  - flake-triage-checklist.md
- reports/
  - test-run-results/   — Playwright HTML reports and artifacts
- playwright.config.ts
- tsconfig.json
- package.json
- README.md

---

## Test strategy (summary)

- Risk-based: prioritize flows impacting revenue and trust — auth, payment, receipts.
- API-first: execute core logic through API tests for speed and determinism.
- Automate high-value, deterministic scenarios first (happy path + critical negatives).
- Use UI only for smoke/regression that can't be validated via API.
- Use idempotent operations or unique test data to avoid cross-test interference.
- Track flaky tests in `triage/flaky-test-analysis.md` and quarantine when needed.

---

## Authentication approach

Primary:
- Obtain a token by logging in via API using `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.

Fallback:
- Use `AUTH_TOKEN` for cases where interactive login / MFA blocks automation.

Implementation is in `automation/helpers/auth.ts` (or `automation/api/helpers/auth.ts`).

---

## CI & reporting recommendations

- Run API tests on every PR for fast feedback.
- Run UI smoke tests on merge/main or on a nightly schedule.
- Persist Playwright reports, screenshots, traces, and logs as CI artifacts.
- Use Playwright trace and video capture on failure to speed triage.
- Do not allow flaky tests to block merges — quarantine and create issues to fix root causes.


---

## Troubleshooting

- Authentication failures: confirm UI_BASE_URL and test account credentials.
- Intermittent failures: enable Playwright tracing and attach traces to issues:
  - Set `PWDEBUG=1` or configure trace options in `playwright.config.ts`.
- Missing env vars: compare `automation/config/env.local` to `automation/config/env.example`.
- Increase log verbosity:
```bash
DEBUG=pw:api npm run test:api
```

---

## Contributing

- Open issues for failing tests, flaky behavior, or missing coverage.
- Follow the test strategy: prefer API-first, deterministic tests and document trade-offs.
- Update `test-plan/test-cases.md` when adding or changing tests.
- Add tests under `automation/api/tests` (API) or `automation/ui/tests` (UI smoke).
- Document any external test data or test account provisioning steps.

---
