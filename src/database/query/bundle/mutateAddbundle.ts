import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';

import { db } from '@/database';
import { BUNDLE_ID_PREFIX } from '@/database/constants';
import type { BundleDocProduct } from '@/database/types';

// Helpers
import { isNumeric, isNumericString, sanitizeNumericString } from '@/helpers';
import { ComPOSError } from '@/helpers/createError';

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

    if (clean_name.trim() === '') throw new Error('Bundle name cannot be empty');
    if (!isNumericString(price))  throw new Error('Bundle price must be a number');
    if (!products.length)         throw new Error('Bundle must have at least one product');

    const clean_price = sanitizeNumericString(price) ?? '0';

    let bundle_active     = true;
    const bundle_products = <BundleDocProduct[]>[];

    for (const product of products) {
      const { id, product_id, active, quantity } = product;

      if (!isNumeric(quantity)) throw new Error('Product quantity must be a number');
      if (!quantity)            throw new Error('Product quantity cannot be zero');

      if (!active) bundle_active = false;

      bundle_products.push({
        id,
        product_id,
        quantity,
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
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
