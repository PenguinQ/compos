import { monotonicFactory } from 'ulidx';

import { db } from '../';

export default async () => {
  const ulid = monotonicFactory();
  const productID = 'PRD_' + ulid();

  await db.product.insert({
    id: productID,
    active: true,
    name: `Product X`,
    description: `This is description for Product X`,
    by: '',
    price: 10000,
    stock: 1,
    sku: '',
    variant: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
};
