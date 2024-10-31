import { monotonicFactory } from 'ulidx';

import { db } from '../';

export default async (_: any, bundle: any) => {
  const ulid = monotonicFactory();
  const { product, price, available } = bundle;
  const productArr = <any[]>[];

  product.forEach((data: any) => {
    const { id, product_id, active } = data;

    productArr.push({ id, product_id, active, quantity: 1 });
  });

  return await db.bundle.bulkInsert([
    {
      id         : 'BND_' + ulid(),
      active     : available,
      name       : 'Bundle 1',
      description: 'Bundle 1 description',
      products   : productArr,
      price      : price,
      auto_price : true,
      created_at : new Date().toISOString(),
      updated_at : new Date().toISOString(),
    },
  ]);
};
