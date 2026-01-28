import { APIRequestContext, expect } from '@playwright/test';

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<{ status: number; body: T }> {
    const res = await this.request.post(url, { data, headers });
    const status = res.status();
    let body: T;

    try {
      body = (await res.json()) as T;
    } catch {
      //empty body end points
      body = {} as T;
    }

    return { status, body };
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<{ status: number; body: T }> {
    const res = await this.request.get(url, { headers });
    const status = res.status();
    const body = (await res.json()) as T;
    return { status, body };
  }

  expectStatus(actual: number, expected: number, message?: string) {
    expect(actual, message).toBe(expected);
  }
}