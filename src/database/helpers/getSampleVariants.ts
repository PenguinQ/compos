import type { RxDocument } from 'rxdb';

import { db } from "../";
import { VariantDoc } from '../types';

export default async (id: string) => {
  try {
    const _queryProduct = await db.product.findOne({ selector: { id } }).exec();

    if (!_queryProduct) throw 'Product not found.';

    const _queryVariants: RxDocument<VariantDoc>[] = await _queryProduct.populate('variants');

    const variants_data = [];

    for (const variant of _queryVariants) {
      const { id, name } = variant;

      variants_data.push({ id, name });
    }

    return variants_data;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
