import { test, expect } from '@playwright/test';
import { ENDPOINTS, PRODUCT_IDS_FOR_DATA_DRIVEN } from '../fixtures/test-data';
import { cartSchema } from '../schemas/cart.schema';
import { assertSchema } from '../helpers/schema-validator';

test.describe('Cart CRUD — Data-Driven', () => {

  for (const productId of PRODUCT_IDS_FOR_DATA_DRIVEN) {
    test(`TEST_${String(productId).padStart(3, '0')}: POST /carts with productId=${productId}`, async ({ request }) => {

      const payload = {
        userId: 1,
        date: '2024-01-01',
        products: [{ productId, quantity: 2 }],
      };

      const response = await request.post(ENDPOINTS.carts, { data: payload });

      expect(response.status()).toBe(201);

      const body = await response.json();
      assertSchema(cartSchema, body, `POST /carts with productId=${productId}`);

      expect(body.userId).toBe(payload.userId);
      expect(body.products).toEqual(payload.products);
      expect(body.products[0].productId).toBe(productId);
    });
  }
});