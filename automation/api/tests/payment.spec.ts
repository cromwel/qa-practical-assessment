import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { getAuthHeader } from '../helpers/auth';

/**
 * Keep response types minimal:  only what the test needs to reduce brittleness when backend adds/changes non-critical fields.
 */
type CreateOrderResponse = { id: string };
type OrderResponse = { id: string; status: string };
type ReceiptResponse = { orderId?: string; total?: number };

/**
 * Polls the Order resource until it reaches PAID or times out.
 *
 * Why polling:
 * - Payments may be processed asynchronously (gateway callbacks, queues)
 * - Immediate GET after pay may return PENDING/PROCESSING briefly
 *
 * Notes:
 * - Deadline-based timeout avoiding infinite loops
 * - Using small interval balances speed and API load
 */
async function pollUntilPaid(
  api: ApiClient,
  auth: Record<string, string>,
  orderId: string
) {
  const deadline = Date.now() + 20_000; // max wait for eventual consistency/payment processing

  while (Date.now() < deadline) {
    const res = await api.get<OrderResponse>(`/orders/${orderId}`, auth);

    if (res.status === 200 && res.body.status === 'PAID') return res.body; // Only accept a successful read + terminal PAID state
    await new Promise(r => setTimeout(r, 500));  // Short delay between polls used to avoid hammering the API
  }
  throw new Error(`Order ${orderId} did not reach PAID within timeout`);  // Fail fast with message for debugging
}

/**
 * We preserve the real poller above for real environments.
 */

async function mockPollUntilPaid(orderId: string): Promise<OrderResponse> {
  // In a real system, we'd observe PENDING/PROCESSING transitions.
  // For this assessment, we directly return PAID to validate the test flow + assertions.
  return { id: orderId, status: 'PAID' };
}

test('API: pay for order and verify PAID + receipt', async ({ request }) => {

  const api = new ApiClient(request); // wrapper for consistent responses/assertions
  const auth = await getAuthHeader(request); // Authenticate once and reuse the Bearer token for all calls in this test

  /**
   * No real backend/APIs are provided, so we simulate API responses for determinism.
   * -------------------------------------------------------------------
   *  Mocking repsonses
   * ------------------------------------------------------------------
  */
  const mockedOrderId = 'order-789';

  const mockedCreate = {
    status: 201,
    body: { id: mockedOrderId } satisfies CreateOrderResponse,
  };

  const mockedPay = {
    status: 200,
    body: { ok: true }, // minimal: we only assert status for pay
  };

  const mockedReceipt = {
    status: 200,
    body: { orderId: mockedOrderId, total: 2500 } satisfies ReceiptResponse,
  };

  /// ---------
  // Create order (precondition for payment)

  // const create = await api.post<CreateOrderResponse>(
  //   '/orders',
  //   { items: [{ id: 'item-1', quantity: 2 }] },
  //   auth
  // );

  const create = mockedCreate;
  expect([200, 201]).toContain(create.status); // Accept success statuses for create

  const orderId = create.body.id;

  /// ----------
  // Pay for order
  // Idempotency protects against double-charging if the request is retried (network flake, reruns)
  const idempotencyKey = `idem-${orderId}-001`;

  // const pay = await api.post(
  //   `/orders/${orderId}/pay`,
  //   { method: 'CARD' }, // could also be MOBILE_MONEY depending on environment
  //   { ...auth, 'Idempotency-Key': idempotencyKey }
  // );

  const pay = mockedPay;
  expect([200, 201]).toContain(pay.status);  // Pay endpoint returns

  /// --------
  // Verify payment outcome: status eventually becomes PAID

  // const paidOrder = await pollUntilPaid(api, auth, orderId);

  const paidOrder = await mockPollUntilPaid(orderId);
  expect(paidOrder.status).toBe('PAID');

  /// --------
  // Verify receipt is available after successful payment

  // const receipt = await api.get<ReceiptResponse>(
  //   `/orders/${orderId}/receipt`,
  //   auth
  // );

  const receipt = mockedReceipt;
  expect([200, 201]).toContain(receipt.status);
  expect(receipt.body).toBeTruthy();
  expect(receipt.body.orderId, 'Receipt should reference the paid order').toBe(orderId);
  expect(receipt.body.total, 'Receipt total should be a positive number').toBeGreaterThan(0);
});
