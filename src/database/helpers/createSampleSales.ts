import { monotonicFactory } from 'ulidx';

import { db } from '@/database';
import { SALES_ID_PREFIX } from '@/database/constants';

export default async (products: string[]) => {
  const ulid = monotonicFactory();
  const products_array = [];
  const item_max = 2;
  let item_count = 0;

  while (item_count < products.length) {
    if (item_count > 0) {
      products_array.push(products.slice(item_count, item_count + item_max));
    } else {
      products_array.push(products.slice(item_count, item_max));
    }

    item_count += item_max;
  };

  const sales_obj = [];

  for (const [index, products] of products_array.entries()) {
    const sales_id = SALES_ID_PREFIX + ulid();

    sales_obj.push({
      id: sales_id,
      name: `Sales ${index + 1}`,
      product: products,
      finished: index === (products_array.length - 1) ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return await db.sales.bulkInsert(sales_obj);
};
