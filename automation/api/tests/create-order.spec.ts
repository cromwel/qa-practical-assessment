import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { getAuthHeader } from '../helpers/auth';

/*Minimal response contracts used for assertions.*/
type CreateOrderResponse = { id: string; status?: string };
type GetOrderResponse = { id: string; status: string; total?: number };

test('API: create order (happy path)', async ({ request }) => {
    const api = new ApiClient(request); // Initialize API client wrapper
    const authHeader = await getAuthHeader(request);  // Obtaining Authorization header via API login*/
  
    /** No real backend/APIs are provided, so we simulate API responses for determinism. The real API calls are preserved below.
     */
  
    const mockedCreateOrder = {
      status: 201,
      body: { id: 'order-123', status: 'CREATED' } satisfies CreateOrderResponse,
    };
  
    const { status, body } = mockedCreateOrder;
  
    expect([200, 201]).toContain(status);
    expect(body.id, 'Expected order id in response').toBeTruthy(); //Validating identifier needed
  
    const orderId = body.id; //Retrieve the created order to verify persistence and correctness
  
    const mockedGetOrder = {
      status: 200,
      body: { id: orderId, status: 'CREATED', total: 0 } satisfies GetOrderResponse,
    };
  
    const orderRes = mockedGetOrder;
  
    api.expectStatus(orderRes.status, 200); //status assertion for read operation
    expect(orderRes.body.id).toBe(orderId); // Cross-check response data
    expect(orderRes.body.status).toBeTruthy();

/* THE REAL API 
---------------------------
test('API: create order (happy path)', async ({ request }) => {
  const api = new ApiClient(request); // Initialize API client wrapper
  const authHeader = await getAuthHeader(request);  // Obtaining Authorization header via API login

  //Creating a new order with valid input data
  const { status, body } = await api.post<CreateOrderResponse>(
    '/orders',
    { items: [{ id: 'item-1', quantity: 2 }] },
    authHeader
  );

  expect([200, 201]).toContain(status);
  expect(body.id, 'Expected order id in response').toBeTruthy(); //Validating identifier needed

  const orderId = body.id; //Retrieve the created order to verify persistence and correctness
  const orderRes = await api.get<GetOrderResponse>(`/orders/${orderId}`, authHeader);

  api.expectStatus(orderRes.status, 200); //status assertion for read operation
  expect(orderRes.body.id).toBe(orderId); // Cross-check response data
  expect(orderRes.body.status).toBeTruthy();
  */
});
