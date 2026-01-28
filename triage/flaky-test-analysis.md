# Flaky Test Investigation — Fails Intermittently in CI, Passes Locally

This document outlines a practical, step-by-step approach to investigating an automated test that fails intermittently in CI but passes locally. The goal is to quickly determine whether the issue is caused by the **test**, the **environment**, or a **real product defect**, and to implement a **durable fix** (not just retries).

---

## 1. Confirm the Failure Pattern (Is it truly flaky?)
**Steps**
- Check CI history: how often does it fail? Is it tied to a specific branch, time, or runner?
- Identify the exact failing assertion / step and capture:
  - failing test name
  - timestamp
  - worker number / parallel shard
  - commit SHA

**Reasoning**
- “Intermittent” can mean: timing, shared data collisions, unstable dependency, or infra instability. The frequency and pattern help narrow the category.

---

## 2. Ensure CI Has the Right Evidence (Artifacts First)
**Steps**
- Collect CI artifacts for failed runs:
  - Playwright trace (preferred)
  - screenshots + video
  - console logs
  - network logs / HAR (if enabled)
  - server logs if accessible (API gateway / app logs)

**Reasoning**
- Flaky issues are hard to debug after the fact. Artifacts reduce guesswork and confirm what the app actually rendered and returned.

---

## 3. Reproduce in a CI-Like Setup Locally
**Steps**
- Run tests in the same mode as CI:
  - headless
  - same browser version
  - same env vars/config
  - same parallelism settings
- Run repeatedly:
  - `--repeat-each N`
  - run only the failing test first (isolation), then run full suite
- Run with throttling if CI is slower (CPU constrained):
  - reduce local resources or run inside a container if CI uses containers

**Reasoning**
- Most CI-only flakes are caused by speed/latency differences, parallelism, or missing dependencies. Reproducing in CI-like conditions is the fastest way to identify these.

---

## 4. Check for Test Data and State Collisions (Most Common Root Cause)
**Steps**
- Confirm the test creates unique data per run:
  - unique user (or unique email)
  - unique order IDs / idempotency keys
  - no reliance on “existing” records
- Confirm cleanup strategy:
  - use ephemeral test data where possible
  - avoid shared accounts across parallel workers unless isolation is guaranteed
- Run suite in parallel locally to reproduce collisions:
  - `--workers N`

**Reasoning**
- CI often runs tests in parallel. If two workers use the same user/order/cart, tests may pass locally (single worker) but fail intermittently in CI.

---

## 5. Validate Synchronization (Timing vs State)
**Steps**
- Identify whether failures happen around:
  - navigation
  - element visibility
  - API callbacks / payment processing
  - status transitions (eventual consistency)
- Replace brittle waits with stable, state-based waits:
  - avoid `waitForTimeout`
  - avoid `networkidle` for apps with polling/websockets
  - prefer waiting for:
    - specific UI markers (test IDs)
    - API responses (`waitForResponse`)
    - URL change (`waitForURL`)
    - business state (e.g., “PAID” via polling with deadline)
- Ensure assertions have reasonable timeouts for async operations.

**Reasoning**
- CI is slower and noisier. Anything relying on “fast execution” or “implicit timing” becomes flaky. State-based synchronization is the durable fix.

---

## 6. Investigate Environment Differences
**Steps**
Compare local vs CI:
- Node version / Playwright version / browser version
- environment variables (base URLs, feature flags)
- database state (seeded vs shared)
- network reliability and latency
- CPU/memory constraints
- timezone/locale differences

**Reasoning**
- A test might pass locally due to a different dataset, different feature flag state, or faster runtime. CI constraints often reveal real race conditions.

---

## 7. Determine if It’s a Real Product Bug
**Steps**
- If artifacts show the UI/API returning inconsistent or invalid states:
  - reproduce via API calls outside the test (curl/Postman)
  - check backend logs around the failure window
  - verify idempotency and state transition correctness
- If the same request sometimes yields different results, treat it as a product reliability bug.

**Reasoning**
- Not all flakes are “test problems.” If the system is inconsistent, the test is a signal. The fix belongs in the product or environment.

---

## 8. Stabilize the Test Without Hiding Bugs
**Preferred fixes (in order)**
1. Fix test data isolation (unique entities per run)
2. Improve synchronization (wait for state, not time)
3. Use stronger selectors (`data-testid`), avoid brittle DOM/text
4. Make assertions minimal for smoke/E2E (verify key outcomes only)
5. Add diagnostics (log request IDs, order IDs, payment refs)

**Avoid**
- Blind retries as the only solution
- Increasing timeouts everywhere without understanding the failure
- Ignoring the failure because it “usually passes”

**Reasoning**
- We want stable tests that still catch real defects. Retries can hide product bugs and delay diagnosis.

---

## 9. Short-Term Containment (If CI is blocked)
**Steps**
- Quarantine the test only if necessary:
  - mark as flaky with a clear reference ticket
  - move to nightly suite temporarily
  - keep the failure visible (reporting) rather than silently ignoring it
- Add targeted retries only around known transient infrastructure issues (not logic failures).

**Reasoning**
- Teams still need CI signal. Quarantine is acceptable temporarily, but must be paired with a fix plan and owner.

---

## 10. Document Findings and Fix
**Steps**
- Document:
  - root cause category (data collision / sync / env / product defect)
  - evidence (trace/screenshot/log snippets)
  - fix implemented
  - prevention step (guideline added, helper improved, shared fixture updated)

**Reasoning**
- Flakiness is a systemic problem. Documentation prevents repeat incidents and improves team practices over time.

---

## Quick Triage Decision Tree
- **Fails only in parallel?** → data collision or shared state
- **Fails on timing/assertion?** → synchronization issue
- **Fails with different responses for same request?** → product reliability bug
- **Fails only on one runner?** → infra / dependency / environment issue
- **Fails after deploys/flags?** → feature flag/config drift

---
