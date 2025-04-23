import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';

import { db } from '@/database';
import { SALE_ID_PREFIX } from '@/database/constants';
import type { SaleDocProduct } from '@/database/types';

// Helpers
import { isNumericString } from '@/helpers';
import { ComPOSError } from '@/helpers/createError';

interface MutateAddSaleParams {
  data: {
    name: string;
    balance?: string;
    products: SaleDocProduct[];
  };
}

export default async ({ data }: MutateAddSaleParams) => {
  try {
    const ulid         = monotonicFactory();
    const { sanitize } = DOMPurify;
    const sale_id = SALE_ID_PREFIX + ulid();
    const { name, balance, products = [] } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '')             throw new Error('Name cannot be empty');
    if (balance && !isNumericString(balance)) throw new Error('Balance must be a number');
    if (!products.length)                     throw new Error('Product cannot be empty');

    await db.sale.insert({
      id           : sale_id,
      finished     : false,
      name         : clean_name,
      products     : products,
      products_sold: [],
      orders       : [],
      revenue      : '0',
      created_at   : new Date().toISOString(),
      updated_at   : new Date().toISOString(),
      ...(balance ? { initial_balance: balance } : {}),
    });
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
