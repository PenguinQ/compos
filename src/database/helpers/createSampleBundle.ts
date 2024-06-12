import { monotonicFactory } from 'ulidx';

import { db } from '../';

export default async (data: any, bundle: any) => {
  const ulid = monotonicFactory();
  const productArr: any = [];
  const { product, price, available } = bundle;

  product.forEach((data: any) => {
    const { id, product_id, active } = data;

    productArr.push({ id, product_id, active, quantity: 1 });
  });

  return await db.bundle.bulkInsert([
    {
      id: 'BND_' + ulid(),
      active: available,
      name: 'Bundle 1',
      description: 'Bundle 1 description',
      products: productArr,
      price: price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'BND_' + ulid(),
      active: available,
      name: 'Bundle 2',
      description: 'Bundle 2 description',
      products: productArr,
      price: price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]);
};
