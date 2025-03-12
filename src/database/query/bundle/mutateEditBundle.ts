import DOMPurify from 'isomorphic-dompurify';

import { db } from '@/database';
import type { BundleDocProduct } from '@/database/types';

// Helpers
import {
  createError,
  isNumeric,
  isNumericString,
  sanitizeNumericString,
} from '@/helpers';
import { ComPOSError } from '@/helpers/createError';

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
    const { sanitize } = DOMPurify;
    const {
      name        = '',
      price       = '0',
      auto_price  = true,
      products    = [],
      description,
      id,
    } = data;

    const _queryBundleConstruct = db.bundle.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    });

    /**
     * ----------------------------
     * 1. Check if bundle is exist.
     * ----------------------------
     */
    const _queryBundle = await _queryBundleConstruct.exec();

    if (!_queryBundle) throw createError('Bundle not found', { status: 404 });

    /**
     * -------------------------------
     * 2. Sanitize and construct data.
     * -------------------------------
     */
    const clean_name = sanitize(name);

    if (clean_name.trim() === '') throw new Error('Bundle name cannot be empty');
    if (!isNumericString(price))  throw new Error('Price must be a number');
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

    /**
     * ----------------------------
     * 2. Update the bundle detail.
     * ----------------------------
     */
    await _queryBundleConstruct.update({
      $set: {
        name       : clean_name,
        active     : bundle_active,
        price      : clean_price,
        products   : bundle_products,
        updated_at : new Date().toISOString(),
        auto_price,
        ...(description ? { description: sanitize(description) } : {}),
      },
    });

    if (!description) {
      await _queryBundleConstruct.update({
        $unset: {
          ...((!description) && { description: true }),
        },
      });
    }
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
