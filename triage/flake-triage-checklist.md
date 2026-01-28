# Intermittent Test Flake Triage Checklist

## Quick summary
- First confirm it's intermittent and capture good failure evidence from CI.
- Reproduce locally in a CI-like environment (headless, same browser, same env).
- Eliminate common causes (timing, data collisions, state leakage, external deps, resources).
- Add targeted instrumentation and test one hypothesis at a time.
- Implement robust fixes, validate them with repeated runs, and add preventive notes and CI safeguards.

---

## 1) Triage and scope the flake
Questions to answer:
- Is it truly intermittent? (e.g ~1/20 runs)
- Where does it occur? (PRs, main, scheduled runs)
- When does it occur? (time of day, under load)

Classify the failure:
- Assertion mismatch (wrong data / UI state)
- Timeout waiting for element / network
- Test crash (browser closed, OOM)
- Infrastructure (service unavailable, DNS, rate limit)

Why: patterns point to causes like timing, contention, or external instability.

---

## 2) Capture the best failure evidence from CI
Collect artifacts on failure:
- Playwright traces, videos, screenshots, console logs
- Network logs
- Server logs covering the test window 
- Exact error message, stack trace and failing step

Practical: configure pipeline to always upload artifacts on failure and keep them long enough to inspect.

---

## 3) Compare CI vs local environment differences
Check for mismatches:
- Runtime & versions: Node, browser channel/version, Playwright/Cypress version, OS, CPU arch
- Headless vs headed
- CI config: parallelism, retries, timeouts, resource limits
- Feature flags, env vars, base URL

---

## 4) Make the failure reproducible (or close)
Run locally in CI-like mode:
- Headless, same browser channel
- Same env vars, timeouts, and test command (including sharding/parallel)
- Repeat runs: loop 50–200 times or use `--repeat-each` if supported
- Run with multiple workers locally to mimic contention

Examples:
- Playwright: npx playwright test --repeat-each=100 --workers=1

Why: a reproducible path is needed to verify fixes.

---

## 5) Check common flake sources (fast elimination pass)

A) Timing & synchronization
- Look for: hard sleeps, waiting on `networkidle`, assertions before UI stabilizes (animations, spinners)
- Fixes:
  - Wait for explicit app-ready signals (data-testid, element state)
  - Prefer `expect(locator).toBeVisible()` / `.toHaveText()` with timeouts over sleeps

B) Test data collisions (parallel CI)
- Check if tests reuse the same users, orders, emails, DB records
- Fixes:
  - Use unique data per run (run id, timestamp, uuid)
  - Isolate tenants/users or use ephemeral environments
  - Clean up after tests or use ephemeral DB instances

C) State leakage / ordering dependencies
- Run test alone vs whole suite; randomize order
- Check for shared storage/session not cleared, reused browser contexts, global mocks not reset
- Fixes: ensure per-test isolation and reset global state

D) External dependencies & network instability
- Identify third-party services (payment sandbox, email, CDN)
- Fixes:
  - Mock or stub external calls with deterministic doubles
  - Add retries only where idempotent and acceptable

E) Performance & resource constraints
- Check CI machine class for CPU throttling, memory pressure
- Fixes:
  - Increase timeouts only after fixing synchronization issues
  - Reduce per-test workload and tune parallelism

Why: these categories cover the majority of flakes.

---

## 6) Add targeted instrumentation
When a failure occurs, logs should answer:
- What URL / route was requested?
- What were the key element states?
- What API responses returned?
- What test data were used?

Practical moves:
- Log generated IDs, emails, orderId, run-id
- Add page.on('console') and page.on('response') logging for relevant endpoints
- Capture screenshots at key checkpoints (not only on failure)
- Upload trace/video artifacts for failed runs

Why: instrumentation converts vague timeouts into actionable facts.

---

## 7) Hypothesis-driven debugging (one change at a time)
- Form one hypothesis from evidence (e.g., "element not found because page not ready")
- Make one targeted change (better selector, explicit wait, unique data)
- Re-run the test repeatedly to confirm or disprove

Why: multiple simultaneous changes can hide the real cause.

---

## 8) Implement robust fixes
Good fixes:
- Replace `networkidle` with a UI-ready marker (e.g., data-testid="loaded")
- Replace hard sleeps with polling or waits for resource/API state
- Create unique test data per run and clean up
- Prefer idempotent API setup over slow UI setup
- Stabilize selectors (use data-testid or role selectors)

Avoid:
- Blindly increasing timeouts everywhere
- Adding global retries without understanding
- Random sleeps as a "fix"

Why: robust fixes improve long-term reliability.

---

## 9) Validate the fix properly
Validation steps:
- Run locally in CI-like mode, repeated many times
- Run in CI on a branch with retries temporarily disabled to see true stability
Check:
- Failure mode disappears
- Runtime remains reasonable
- No new flakes introduced

Why: short test runs or retries can hide residual flakiness.

---

## 10) Prevent recurrence
- Add a short note to the test file or repository README: cause, fix, and signal to wait for
- CI safeguards:
  - Upload traces/videos/logs on failure
  - Quarantine known flakes and track them
  - Track flake rate over time (dashboard/weekly report)

Example note in test or README:
- "Flake cause: shared user data in concurrent runs. Fix: use unique user-per-run (run-id). If this fails, check server logs for duplicate account creation."

---

## Quick troubleshooting checklist
- [ ] Confirm failure frequency and pattern in CI history
- [ ] Save traces, videos, screenshots, console & network logs
- [ ] Reproduce locally with CI-like settings, repeat many times
- [ ] Look for sleeps / networkidle / unstable selectors
- [ ] Ensure unique test data for parallel runs
- [ ] Add targeted logging and screenshots
- [ ] Make one hypothesis-driven change and re-run
- [ ] Validate on branch with retries off
- [ ] Document root cause and fix, enable CI artifacts on fail

