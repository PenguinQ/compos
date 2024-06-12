import { monotonicFactory } from 'ulidx';
import { sanitize } from 'isomorphic-dompurify';

import { db } from '@/database';

// Common Helpers
import { isNumeric } from '@helpers';

// Database Constants
import { BUNDLE_ID_PREFIX } from '@/database/constants';

type MutateAddBundleProduct = {
  id: string;
  product_id: string;
  active: boolean;
  quantity: number;
};

type MutateAddBundleQuery = {
  name: string;
  description: string;
  price: number;
  auto_price: boolean;
  products: MutateAddBundleProduct[];
};

export default async (data: MutateAddBundleQuery) => {
  try {
    const ulid       = monotonicFactory();
    const bundle_id = BUNDLE_ID_PREFIX + ulid();
    const {
      name,
      description,
      price      = 0,
      auto_price = true,
      products   = [],
    } = data;
    const clean_name        = sanitize(name);
    const clean_description = description && sanitize(description);

    if (clean_name.trim() === '') throw 'Bundle name cannot be empty.';
    if (!isNumeric(price))        throw 'Bundle price must be a number.';
    if (!products.length)         throw 'Bundle must have at least one product.';

    const clean_price = parseInt(price as unknown as string);

    let bundle_active     = true;
    const bundle_products = [];

    for (const product of products) {
      const { id, product_id, active, quantity } = product;

      if (!isNumeric(quantity)) throw 'Product quantity must be a number';
      if (!quantity)            throw 'Product quantity cannot be zero';

      const clean_quantity = parseInt(quantity as unknown as string);

      if (!active) bundle_active = false;

      bundle_products.push({
        id,
        product_id,
        active,
        quantity: clean_quantity,
      });
    }

    await db.bundle.insert({
      id         : bundle_id,
      active     : bundle_active,
      name       : clean_name,
      description: clean_description,
      auto_price : auto_price,
      price      : clean_price,
      products   : bundle_products,
      created_at : new Date().toISOString(),
      updated_at : new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
