import { monotonicFactory } from 'ulidx';

import { db } from '@/database';
import { SALES_ID_PREFIX } from '@/database/constants';
import type { SalesDoc, SalesDocProduct } from '../types';

export default async (products: SalesDocProduct[]) => {
  const ulid = monotonicFactory();
  const products_array = [];
  const item_max = 3;
  let item_count = 0;

  while (item_count < item_max) {
    products_array.push(products);
    item_count += 1;
  };

  const sales_obj: SalesDoc[] = [];

  for (const [index, products] of products_array.entries()) {
    const sales_id = SALES_ID_PREFIX + ulid();

    sales_obj.push({
      id: sales_id,
      finished: false,
      name: `Sales ${index + 1}`,
      products: products,
      products_sold: [],
      orders: [],
      revenue: 0,
      discount: '0',
      discount_type: 'percentage',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return await db.sales.bulkInsert(sales_obj);
};
