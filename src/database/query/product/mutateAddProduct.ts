import { monotonicFactory } from 'ulidx';
import { sanitize } from 'isomorphic-dompurify';

import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { VariantDoc } from '@/database/types';
import { isNumeric } from '@/helpers';

type ProductVariant = VariantDoc & {
  new_image: File[];
};

type MutateAddProductQueryData = {
  name: string;
  description?: string;
  by?: string;
  price: number;
  stock: number;
  sku?: string;
  variant: any[];
  new_image?: File[];
};

type MutateAddProductQuery = {
  data: MutateAddProductQueryData;
};

export default async ({ data }: MutateAddProductQuery) => {
  try {
    const ulid       = monotonicFactory();
    const product_id = PRODUCT_ID_PREFIX + ulid();
    const {
      name,
      description,
      by,
      sku,
      price      = 0,
      stock      = 0,
      variant    = [],
      new_image  = [],
    } = data;
    const sanitized_name = sanitize(name);
    const sanitized_description = description && sanitize(description);
    const sanitized_by = by && sanitize(by);
    const sanitized_sku = sku && sanitize(sku);

    if (sanitized_name.trim() === '') throw 'Name cannot be empty.';
    if (!isNumeric(price))            throw 'Price must be a number.';
    if (!isNumeric(stock))            throw 'Stock must be a number.';

    /**
     * ----------------------
     * 1. With variants flow.
     * ----------------------
     */
    if (variant.length) {
      let product_active                  = true;
      const variant_ids: string[]         = [];
      const variant_array: VariantDoc[]   = [];
      const variant_attachments: File[][] = [];

      variant.map((v: ProductVariant) => {
        const v_id = VARIANT_ID_PREFIX + ulid();
        const {
          name     : v_name,
          sku      : v_sku,
          price    : v_price     = 0,
          stock    : v_stock     = 0,
          new_image: v_new_image = [],
        } = v;
        const sanitized_name = sanitize(v_name);
        const sanitized_sku  = v_sku && sanitize(v_sku);

        if (sanitized_name.trim() === '') throw 'Variant name cannot be empty.';
        if (!isNumeric(v_price))          throw 'Price must be a number.';
        if (!isNumeric(v_stock))          throw 'Stock must be a number.';

        variant_array.push({
          id        : v_id,
          product_id: product_id,
          active    : v_stock >= 1 ? true : false,
          name      : sanitized_name,
          sku       : sanitized_sku,
          price     : v_price,
          stock     : v_stock,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        variant_ids.push(v_id);
        variant_attachments.push(v_new_image);
      });

      const inactiveVariant = variant_array.filter(v => v.active === false);

      if (inactiveVariant.length === variant_array.length) product_active = false;

      /**
       * --------------------
       * 1.1. Insert product.
       * --------------------
       */
      const _queryProduct = await db.product.insert({
        id         : product_id,
        active     : product_active,
        name       : sanitized_name,
        description: sanitized_description,
        by         : sanitized_by,
        sku        : sanitized_sku,
        price      : 0,
        stock      : 0,
        variant    : variant_ids,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
      });

      /**
       * -----------------------------
       * 1.2. Product images handling.
       * -----------------------------
       */
      if (new_image.length) {
        if (!isImagesValid(new_image)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_image);

        if (thumbnails.length) await addImages(thumbnails, _queryProduct);
        if (images.length)     await addImages(images, _queryProduct);
      }

      /**
       * ----------------------------
       * 1.3 Insert product variants.
       * ----------------------------
       */
      const _variantQuery = await db.variant.bulkInsert(variant_array);
      const { success: variants }  = _variantQuery;

      /**
       * -----------------------------
       * 1.4. Variant images handling.
       * -----------------------------
       */
      if (variants.length) {
        for (const [index, variant] of variants.entries()) {
          if (variant_attachments[index].length) {
            if (!isImagesValid(variant_attachments[index])) throw 'Invalid file types.';

            const { thumbnails, images } = await compressProductImage(variant_attachments[index]);

            if (thumbnails.length) await addImages(thumbnails, variant);
            if (images.length)     await addImages(images, variant);
          }
        }
      }
    }
    /**
     * -------------------------
     * 2. Without variants flow.
     * -------------------------
     */
    else {
      /**
       * --------------------
       * 2.1. Insert product.
       * --------------------
       */
      const _queryProduct = await db.product.insert({
        name       : sanitized_name,
        description: sanitized_description,
        by         : sanitized_by,
        sku        : sanitized_sku,
        id         : product_id,
        active     : stock >= 1 ? true : false,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        variant    : [],
        price,
        stock,
      });

      /**
       * -----------------------------
       * 2.2. Product images handling.
       * -----------------------------
       */
      if (new_image.length) {
        if (!isImagesValid(new_image)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_image);

        if (thumbnails.length) await addImages(thumbnails, _queryProduct);
        if (images.length)     await addImages(images, _queryProduct);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
