import { APIRequestContext, expect } from '@playwright/test';

/**
 * Lightweight API client wrapper whose Purpose is to:
 * - Centralize HTTP request logic
 * - Standadize response handling (status + body)
 * - Reduce duplication in API tests
 */

export class ApiClient {
  constructor(private request: APIRequestContext) {}

   /**
   * Sending a POST request that:-
   * - Care for optional payload and headers
   * - Handle endpoints that return an empty response body
   */
  async post<T>(url: string, data?: unknown, headers?: Record<string, string>): Promise<{ status: number; body: T }> {
    const res = await this.request.post(url, { data, headers });
    const status = res.status();
    let body: T;

    try {
      body = (await res.json()) as T;
    } catch {
      //catch empty body end points such as payment callback to avoid tests failing
      body = {} as T;
    }

    return { status, body };
  }

  /**
   * Sending a GET request:-
   * - Assume JSON response
   * - Return both HTTP status and parsed body for assertions
   */
  async get<T>(url: string, headers?: Record<string, string>): Promise<{ status: number; body: T }> {
    const res = await this.request.get(url, { headers });
    const status = res.status();
    const body = (await res.json()) as T;
    return { status, body };
  }

  //Wrapper that expects for HTTP status assertions.
   
  expectStatus(actual: number, expected: number, message?: string) {
    expect(actual, message).toBe(expected);
  }
}