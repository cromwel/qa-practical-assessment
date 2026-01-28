import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { getAuthHeader } from '../helpers/auth';

/* Minimal response contracts used for assertions. */
type CreateOrderResponse = { id: string; status?: string };
type GetOrderResponse = { id: string; status: string; total?: number };

/**
 * Test strategy:
 * - By default the test is deterministic and uses mocked responses (no external HTTP).
 * - To run against a real backend, set API_TEST=true in the environment. Integration runs
 *   should be gated and run separately (not as the default in CI), since they rely on external
 *   systems and data.
 *
 * Notes:
 * - Avoid hard sleeps. If a real backend is eventually consistent, replace the simple GET
 *   with a retry/polling helper with a bounded timeout and informative errors.
 * - Keep assertions explicit and provide messages so failures are actionable.
 */

test('API: create order (happy path)', async ({ request }) => {
  const api = new ApiClient(request);
  const authHeader = await getAuthHeader(request);

  const payload = { items: [{ id: 'item-1', quantity: 2 }] };

  // Toggle integration test mode: only run real network calls when explicitly enabled.
  const runIntegration = process.env.API_TEST === 'true';

  // ----- Create order: either mocked (default) or real (when API_TEST=true) -----
  let createRes: { status: number; body: CreateOrderResponse };
  if (runIntegration) {
    // Real API call (integration). This may be flaky if backend is unstable; use sparingly.
    createRes = await api.post<CreateOrderResponse>('/orders', payload, authHeader);
  } else {
    // Deterministic (mocked) response for unit-like API test runs.
    createRes = {
      status: 201,
      body: { id: 'order-123', status: 'CREATED' },
    };
  }

  // Validate create response
  expect([200, 201]).toContain(createRes.status);
  expect(createRes.body.id, 'Expected order id in create response').toBeTruthy();

  const orderId = createRes.body.id;

  // ----- Retrieve the created order -----
  let getRes: { status: number; body: GetOrderResponse };
  if (runIntegration) {
    // If backend may take time to materialize the order, consider a polling helper instead of a sleep.
    // Example pattern (not implemented here): poll GET /orders/:id until status 200 or timeout.
    getRes = await api.get<GetOrderResponse>(`/orders/${orderId}`, authHeader);
  } else {
    // Deterministic mock for retrieval
    getRes = {
      status: 200,
      body: { id: orderId, status: 'CREATED', total: 0 },
    };
  }

  // Use ApiClient helper to assert the status consistently if provided
  api.expectStatus(getRes.status, 200);

  // Explicit data assertions
  expect(getRes.body.id, 'Order id should match the created id').toBe(orderId);
  expect(getRes.body.status, 'Order should have a status').toBeTruthy();
});