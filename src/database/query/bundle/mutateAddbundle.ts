import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';

import { db } from '@/database';
import { BUNDLE_ID_PREFIX } from '@/database/constants';
import type { BundleDocProduct } from '@/database/types';

// Helpers
import { isNumeric, sanitizeNumeric } from '@/helpers';

type MutateAddBundleQuery = {
  name: string;
  description?: string;
  price: string;
  auto_price: boolean;
  products: BundleDocProduct[];
};

export default async (data: MutateAddBundleQuery) => {
  try {
    const { sanitize } = DOMPurify;
    const ulid       = monotonicFactory();
    const bundle_id  = BUNDLE_ID_PREFIX + ulid();
    const {
      name        = '',
      price       = '0',
      auto_price  = true,
      products    = [],
      description,
    } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '') throw 'Bundle name cannot be empty.';
    if (!isNumeric(price))        throw 'Bundle price must be a number.';
    if (!products.length)         throw 'Bundle must have at least one product.';

    const clean_price = sanitizeNumeric(price) as string;

    let bundle_active     = true;
    const bundle_products = <BundleDocProduct[]>[];

    for (const product of products) {
      const { id, product_id, active, quantity } = product;

      if (!isNumeric(quantity)) throw 'Product quantity must be a number.';
      if (!quantity)            throw 'Product quantity cannot be zero.';

      const clean_quantity = sanitizeNumeric(quantity) as number;

      if (!active) bundle_active = false;

      bundle_products.push({
        quantity: clean_quantity,
        id,
        product_id,
        active,
      });
    }

    await db.bundle.insert({
      id         : bundle_id,
      active     : bundle_active,
      name       : clean_name,
      auto_price : auto_price,
      price      : clean_price,
      products   : bundle_products,
      created_at : new Date().toISOString(),
      updated_at : new Date().toISOString(),
      ...(description ? { description: sanitize(description) } : {}),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
