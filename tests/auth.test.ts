import { test, expect } from '@playwright/test';
import { ENDPOINTS, VALID_CREDENTIALS, INVALID_CREDENTIALS } from '../fixtures/test-data';

test.describe('Authentication', () => {

  // ---------- Positive ----------

  test('AUTH_001: login with valid credentials returns 200 + token', async ({ request }) => {
    const response = await request.post(ENDPOINTS.login, {
      data: VALID_CREDENTIALS,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(10);
  });

  // ---------- Negative ----------

  test('AUTH_002: login with invalid credentials returns error status', async ({ request }) => {
    const response = await request.post(ENDPOINTS.login, {
      data: INVALID_CREDENTIALS,
    });
    expect(response.status()).toBe(401);
  });

  test('AUTH_003: login with missing username returns error', async ({ request }) => {
    const response = await request.post(ENDPOINTS.login, {
      data: { password: VALID_CREDENTIALS.password },
    });
    expect(response.status()).toBe(400);
  });

  test('AUTH_004: login with missing password returns error', async ({ request }) => {
    const response = await request.post(ENDPOINTS.login, {
      data: { username: VALID_CREDENTIALS.username },
    });

    expect(response.status()).toBe(400);
  });

  test('AUTH_005: login with empty body returns error', async ({ request }) => {
    const response = await request.post(ENDPOINTS.login, {
      data: {},
    });

    expect(response.status()).toBe(400);
  });
});