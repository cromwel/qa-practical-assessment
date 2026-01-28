import { APIRequestContext, expect } from '@playwright/test';

type LoginResponse = {
  token?: string;
  access_token?: string;
};

export async function getAuthHeader(request: APIRequestContext): Promise<Record<string, string>> {
 
  // Login via API to obtain token 
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing TEST_USER_EMAIL / TEST_USER_PASSWORD in env. Set them in automation/config/env.local');
  }

  const res = await request.post('/auth/login', {
    data: { email, password }
  });

  expect(res.ok(), 'Login failed - check credentials and /auth/login endpoint').toBeTruthy();

  const body = (await res.json()) as LoginResponse;
  const token = body.token || body.access_token;

  if (!token) {
    throw new Error('Login response did not include a token. Update LoginResponse parsing in auth.ts');
  }

  return { Authorization: `Bearer ${token}` };
}