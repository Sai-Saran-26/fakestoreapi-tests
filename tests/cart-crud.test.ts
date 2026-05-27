import { test, expect } from '@playwright/test';
import { ENDPOINTS, NON_EXISTENT_IDS, SAMPLE_CART_PAYLOAD, UPDATED_CART_PAYLOAD  } from '../fixtures/test-data';

test.describe('Cart CRUD Operations @positive', () => {

    test(' TEST_001 - GET all Carts', async({ request }) => {
        const response = await request.get(ENDPOINTS.carts);

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);

    });

    test('TEST_002 - GET Cart by ID', async({ request }) => {
        const response = await request.get(ENDPOINTS.cartById(1));
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('id', 1);
        expect(body).toHaveProperty('userId');
        expect(body).toHaveProperty('date');
        expect(body).toHaveProperty('products');
        expect(Array.isArray(body.products)).toBeTruthy();
    });

    test('TEST_003 - POST Create a new Cart', async({ request }) => {
        const response = await request.post(ENDPOINTS.carts, {
            data: SAMPLE_CART_PAYLOAD,
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('userId');
        expect(body.userId).toBe(SAMPLE_CART_PAYLOAD.userId);
        expect(body.products).toEqual(SAMPLE_CART_PAYLOAD.products);
    });

    test('TEST_004 - PUT Update an existing Cart', async({ request }) => {
        const createResponse = await request.post(ENDPOINTS.carts, {
            data: SAMPLE_CART_PAYLOAD,
        });
        const createdCart = await createResponse.json();
        const cartId = createdCart.id;

        const updateResponse = await request.put(ENDPOINTS.cartById(cartId), {
            data: UPDATED_CART_PAYLOAD,
        });
        expect(updateResponse.status()).toBe(200);
        const updatedBody = await updateResponse.json();
        expect(updatedBody.id).toBe(cartId);
        expect(updatedBody.products).toEqual(UPDATED_CART_PAYLOAD.products);
    });

    test('TEST_005 - DELETE a Cart', async({ request }) => {
        const createResponse = await request.post(ENDPOINTS.carts, {
            data: SAMPLE_CART_PAYLOAD,
        });
        const createdCart = await createResponse.json();
        const cartId = createdCart.id;

        const deleteResponse = await request.delete(ENDPOINTS.cartById(cartId));
        expect(deleteResponse.status()).toBe(200);
    });
});

test.describe('Cart CRUD Operations @negative', () => {

        test('TEST_006 - GET Cart by non-existent ID', async({ request }) => {
            const response = await request.get(ENDPOINTS.cartById(999999));
            if(response.status() === 200) {
                const body = await response.text();
                expect(body === '' || body === 'null' || body === '{}').toBe(true);
            } else {
                expect(response.status()).toBe(404);
            }
        });

        test('TEST_007 - GET /carts/abc (non-numeric id) is handled gracefully', async ({ request }) => {
            const response = await request.get(ENDPOINTS.cartById('abc'));
            if (response.status() === 200) 
            {
                const body = await response.text();
                expect(body === '' || body === 'null' || body === '{}').toBe(true);
            } else {
            expect(response.status()).toBeGreaterThanOrEqual(400);
            expect(response.status()).toBeLessThan(500);
            }
        });

        test('TEST_008 - POST /carts with empty body', async ({ request }) => {
            const response = await request.post(ENDPOINTS.carts, {
                data: {},
            });
            if (response.status() === 201) {
                const body = await response.json();
                expect(body).toHaveProperty('id');
            } else {
            expect(response.status()).toBe(400);
            }
        });

        test('TEST_009 - POST /carts with invalid product structure', async ({ request }) => {
            const response = await request.post(ENDPOINTS.carts, {
            data: {
                userId: 1,
                date: '2024-01-01',
                products: [{ productId: 'not-a-number', quantity: 'also-not-a-number' }],
            },
            });
            if (response.status() === 201) {
                const body = await response.json();
                expect(body).toHaveProperty('id');
            } else {
                expect(response.status()).toBe(400);
            }
        });

        test('TEST_010 - PUT /carts/{nonExistentId} returns 200 or 404', async ({ request }) => {
            const response = await request.put(ENDPOINTS.cartById(NON_EXISTENT_IDS.cart), {
            data: { userId: 1, products: [] },
            });

            if (response.status() === 200) {
                const body = await response.json();
                expect(body).toBeDefined();
            } else {
                expect(response.status()).toBe(404);
            }
        });

        test('TEST_011 - DELETE /carts/{nonExistentId} returns 200 or 404', async ({ request }) => {
            const response = await request.delete(ENDPOINTS.cartById(NON_EXISTENT_IDS.cart));
            expect(response.status() === 200 || response.status() === 404).toBe(true)
        });
});

