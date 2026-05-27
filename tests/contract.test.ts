import { test, expect } from '@playwright/test';
import { ENDPOINTS } from '../fixtures/test-data';

function describeShape(value: unknown): unknown {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return ['empty-array'];
    return [describeShape(value[0])];
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      result[key] = describeShape((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return typeof value;
}

test.describe('Cart Contract Tests', () => {

  test('CONTRACT_001: GET /carts/1 response shape is stable', async ({ request }) => {
    const response = await request.get(ENDPOINTS.cartById(1));
    expect(response.status()).toBe(200);

    const body = await response.json();
    const shape = describeShape(body);

    expect(JSON.stringify(shape, null, 2)).toMatchSnapshot('cart-shape.json');
  });

  test('CONTRACT_002: POST /carts response shape is stable', async ({ request }) => {
    const response = await request.post(ENDPOINTS.carts, {
      data: { userId: 1, date: '2024-01-01', products: [{ productId: 1, quantity: 1 }] },
    });
    expect(response.status()).toBe(201);

    const body = await response.json();
    const shape = describeShape(body);

    expect(JSON.stringify(shape, null, 2)).toMatchSnapshot('cart-post-shape.json');
  });

  test('CONTRACT_003: GET /carts list response shape is stable', async ({ request }) => {
    const response = await request.get(ENDPOINTS.carts);
    expect(response.status()).toBe(200);

    const body = await response.json();
    const shape = describeShape(body);

    expect(JSON.stringify(shape, null, 2)).toMatchSnapshot('carts-list-shape.json');
  });
});