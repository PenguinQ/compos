import { sanitize } from 'isomorphic-dompurify';

import { db } from '@/database';
import type { BundleDocProduct } from '@/database/types';

// Helpers
import { isNumeric, sanitizeNumeric } from '@/helpers';

type MutateEditBundleQuery = {
  id: string;
  name: string;
  description: string;
  price: string;
  auto_price: boolean;
  products: BundleDocProduct[];
};

export default async (data: MutateEditBundleQuery) => {
  try {
    const {
      name        = '',
      description = '',
      price       = 0,
      auto_price  = true,
      products    = [],
      id,
    } = data;

    /**
     * ----------------------------
     * 1. Check if bundle is exist.
     * ----------------------------
     */
    const _queryBundle = await db.bundle.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    if (!_queryBundle) throw `Cannot edit the current bundle, there's no bundle with id ${id}.`;

    /**
     * -------------------------------
     * 2. Sanitize and construct data.
     * -------------------------------
     */
    const clean_name        = sanitize(name);
    const clean_description = sanitize(description);

    if (clean_name.trim() === '') throw 'Bundle name cannot be empty.';
    if (!isNumeric(price))        throw 'Price must be a number.';
    if (!products.length)         throw 'Bundle must have at least one product.';

    const clean_price = sanitizeNumeric(price) as string;

    let bundle_active     = true;
    const bundle_products = <BundleDocProduct[]>[];

    for (const product of products) {
      console.log(product);
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

    /**
     * ----------------------------
     * 2. Update the bundle detail.
     * ----------------------------
     */
    await _queryBundle.update({
      $set: {
        name       : clean_name,
        active     : bundle_active,
        description: clean_description,
        price      : clean_price,
        products   : bundle_products,
        updated_at : new Date().toISOString(),
        auto_price,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
