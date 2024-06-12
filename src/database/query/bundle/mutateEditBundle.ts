import { sanitize } from 'isomorphic-dompurify';

import { db } from '@/database';

// Common Helpers
import { isNumeric } from '@/helpers';

type MutateEditBundleProduct = {
  id: string;
  active: boolean;
  quantity: number;
};

type MutateEditBundleQuery = {
  id: string;
  name: string;
  description: string;
  price: number;
  auto_price: boolean;
  products: MutateEditBundleProduct[];
};

export default async (data: MutateEditBundleQuery) => {
  try {
    const {
      id,
      name,
      description,
      price       = 0,
      auto_price  = true,
      products    = [],
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

    if (!_queryBundle) throw `Cannot edit the current bundle, there's no bundle with id ${id}`;

    /**
     * -------------------------------
     * 2. Sanitize and construct data.
     * -------------------------------
     */
    const clean_name        = sanitize(name);
    const clean_description = description && sanitize(description);

    if (clean_name.trim() === '') throw 'Bundle name cannot be empty.';
    if (!isNumeric(price))        throw 'Price must be a number.';
    if (!products.length)         throw 'Bundle must have at least one product.';

    const clean_price = parseInt(price as unknown as string);

    let bundle_active     = true;
    const bundle_products = [];

    for (const product of products) {
      const { id, active, quantity } = product;

      if (!isNumeric(quantity)) throw 'Product quantity must be a number';
      if (!quantity)            throw 'Product quantity cannot be zero';

      const clean_quantity = parseInt(quantity as unknown as string);

      if (!active) bundle_active = false;

      bundle_products.push({
        id,
        active,
        quantity: clean_quantity,
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
        auto_price,
        updated_at : new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
