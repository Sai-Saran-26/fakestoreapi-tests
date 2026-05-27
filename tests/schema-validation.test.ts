import { test, expect } from '@playwright/test';
import { ENDPOINTS, SAMPLE_CART_PAYLOAD } from '../fixtures/test-data';
import { cartSchema, cartsListSchema } from '../schemas/cart.schema';
import { assertSchema, validateSchema } from '../helpers/schema-validator';

test.describe('Cart Schema Validation', () => {

  test('TEST_001: GET /carts response conforms to cart array schema', async ({ request }) => {
    const response = await request.get(ENDPOINTS.carts);
    expect(response.status()).toBe(200);

    const body = await response.json();
    assertSchema(cartsListSchema, body, 'GET /carts response');
  });

  test('TEST_002: GET /carts/1 conforms to cart schema', async ({ request }) => {
    const response = await request.get(ENDPOINTS.cartById(1));
    expect(response.status()).toBe(200);

    const body = await response.json();
    assertSchema(cartSchema, body, 'GET /carts/1 response');
  });

  test('TEST_003: POST /carts response conforms to cart schema', async ({ request }) => {
    const response = await request.post(ENDPOINTS.carts, { data: SAMPLE_CART_PAYLOAD });
    expect(response.status()).toBe(201);

    const body = await response.json();
    assertSchema(cartSchema, body, 'POST /carts response');
  });

  test('TEST_004: PUT /carts/1 response conforms to cart schema', async ({ request }) => {
    const response = await request.put(ENDPOINTS.cartById(1), { data: SAMPLE_CART_PAYLOAD });
    expect(response.status()).toBe(200);

    const body = await response.json();
    assertSchema(cartSchema, body, 'PUT /carts/1 response');
  });

  test('TEST_005: GET /carts/user/1 conforms to cart array schema', async ({ request }) => {
    const response = await request.get(ENDPOINTS.cartsByUser(1));
    expect(response.status()).toBe(200);

    const body = await response.json();
    assertSchema(cartsListSchema, body, 'GET /carts/user/1 response');
  });

  test('TEST_006: validator correctly rejects an invalid payload', async () => {
    const invalidCart = {
      id: 'not-a-number',   
    };

    const { valid, errors } = validateSchema(cartSchema, invalidCart);
    expect(valid).toBe(false);
    expect(errors).not.toBeNull();
    expect(errors!.length).toBeGreaterThan(0);
  });
});