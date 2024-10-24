import { sanitize } from 'isomorphic-dompurify';

import { db } from '@/database';
import type { SalesDocProduct } from '@/database/types';

type MutateEditSalesQueryData = {
  name: string;
  products: SalesDocProduct[];
};

type MutateEditSalesQuery = {
  id: string;
  data: MutateEditSalesQueryData;
};

export default async ({ id, data }: MutateEditSalesQuery) => {
  try {
    const { name, products } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '') throw 'Name cannot be empty.';
    if (!products.length)         throw 'Product cannot be empty.';

    const _querySales = await db.sales.findOne(id).exec();

    if (!_querySales) throw `Cannot find sales with id ${id}.`;

    await _querySales.update({
      $set: {
        name      : clean_name,
        updated_at: new Date().toISOString(),
        products,
      },
    })
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
