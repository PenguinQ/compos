import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';

import { db } from '@/database';
import { SALE_ID_PREFIX } from '@/database/constants';
import type { SaleDocProduct } from '@/database/types';

// Helpers
import { isNumeric } from '@/helpers';
import { ComPOSError } from '@/helpers/createError';

type MutateAddSaleQueryData = {
  name: string;
  balance?: string;
  products: SaleDocProduct[];
};

type MutateAddSaleQuery = {
  data: MutateAddSaleQueryData;
};

export default async ({ data }: MutateAddSaleQuery) => {
  try {
    const { sanitize } = DOMPurify;
    const ulid    = monotonicFactory();
    const sale_id = SALE_ID_PREFIX + ulid();
    const { name, balance, products = [] } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '')       throw new Error('Name cannot be empty');
    if (balance && !isNumeric(balance)) throw new Error('Balance must be a number');
    if (!products.length)               throw new Error('Product cannot be empty');

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
