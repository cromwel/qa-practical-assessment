import { APIRequestContext, expect } from '@playwright/test';

/**
 * Supported login response shapes.
 * Some auth services return `token`, others `access_token`.
 */
type LoginResponse = {
  token?: string;
  access_token?: string;
};

export async function getAuthHeader(request: APIRequestContext): Promise<Record<string, string>> {
// Preferred: authenticate via login endpoint for reproducible CI runs.
// Fallback: using AUTH_TOKEN if the environment cannot support automated login

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
//log in via API
  if (email || password) {
  const res = await request.post('/auth/login', {
    data: { email, password }
  });

  expect(res.ok(), 'Login failed, check credentials and /auth/login endpoint').toBeTruthy();

  const body = (await res.json()) as LoginResponse;
  const token = body.token || body.access_token;

  if (!token) {
    throw new Error('Login response did not include a token. Update LoginResponse parsing in auth.ts');
  }

  return { Authorization: `Bearer ${token}` };
}

// Token is pre-provisioned/failed API log in
if (process.env.AUTH_TOKEN) {
    return { Authorization: `Bearer ${process.env.AUTH_TOKEN}` };
  }
  // 3) Fail fast if neither method is configured
  throw new Error(
    'No authentication method configured. Set TEST_USER_EMAIL and TEST_USER_PASSWORD (preferred), ' +
      'or set AUTH_TOKEN as a fallback.'
  );
}