export const ENDPOINTS = {
  carts: '/carts',
  cartById: (id: number | string) => `/carts/${id}`,
  cartsByUser: (userId: number | string) => `/carts/user/${userId}`,
  login: '/auth/login',
} 

export const VALID_CREDENTIALS = {
  username: 'mor_2314',
  password: '83r5^_',
} 

export const INVALID_CREDENTIALS = {
  username: 'invalid_user',
  password: 'wrong_password',
} as const;

export const SAMPLE_CART_PAYLOAD = {
  userId: 1,
  date: '2024-01-01',
  products: [
    { productId: 1, quantity: 2 },
    { productId: 5, quantity: 1 },
    { productId: 9, quantity: 3 },
  ],
};

export const UPDATED_CART_PAYLOAD = {
  userId: 1,
  date: '2024-02-01',
  products: [{ productId: 3, quantity: 5 }],
};

export const PRODUCT_IDS_FOR_DATA_DRIVEN = [1, 5, 10, 15, 20];

export const NON_EXISTENT_IDS = {
  cart: 999999,
} 