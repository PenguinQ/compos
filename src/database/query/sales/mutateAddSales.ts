import { monotonicFactory } from 'ulidx';
import { sanitize } from 'isomorphic-dompurify';

import { db } from '@/database';
import { SALES_ID_PREFIX } from '@/database/constants';
import type { SalesDocProduct } from '@/database/types';

type MutateAddSalesQueryData = {
  name: string;
  products: SalesDocProduct[];
};

type MutateAddSalesQuery = {
  data: MutateAddSalesQueryData;
};

export default async ({ data }: MutateAddSalesQuery) => {
  try {
    const ulid     = monotonicFactory();
    const sales_id = SALES_ID_PREFIX + ulid();
    const { name, products = [] } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '') throw 'Name cannot be empty.';
    if (!products.length)         throw 'Product cannot be empty.';

    await db.sales.insert({
      id           : sales_id,
      finished     : false,
      name         : clean_name,
      products     : products,
      products_sold: [],
      orders       : [],
      revenue      : '0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
