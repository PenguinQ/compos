import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { VariantDoc } from '@/database/types';

// Helpers
import { isNumeric, isNumericString, sanitizeNumericString } from '@/helpers';
import { ComPOSError } from '@/helpers/createError';

type Variant = Partial<VariantDoc> & {
  new_images?: File[];
};

interface MutateAddProductParams {
  name: string;
  description?: string;
  by?: string;
  price?: string;
  stock?: number;
  sku?: string;
  variants?: Variant[];
  new_images?: File[];
}

export default async (data: MutateAddProductParams) => {
  try {
    const { sanitize } = DOMPurify;
    const ulid       = monotonicFactory();
    const product_id = PRODUCT_ID_PREFIX + ulid();
    const {
      name  = '',
      price = '0',
      stock = 0,
      by,
      description,
      new_images,
      sku,
      variants,
    } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '') throw new Error('Product name cannot be empty');
    if (!isNumericString(price))  throw new Error('Product price must be a number');
    if (!isNumeric(stock))        throw new Error('Product stock must be a number');

    /**
     * ----------------------
     * 1. With variants flow.
     * ----------------------
     */
    if (variants && variants.length) {
      let product_active        = true;
      const variant_ids         = [];
      const variant_array       = [];
      const variant_attachments = [];

      for (const variant of variants) {
        const v_id = VARIANT_ID_PREFIX + ulid();
        const {
          name      : v_name       = '',
          price     : v_price      = '0',
          stock     : v_stock      = 0,
          new_images: v_new_images = [],
          sku       : v_sku,
        } = variant;
        const clean_v_name = sanitize(v_name);

        if (clean_v_name.trim() === '') throw new Error('Variant name cannot be empty');
        if (!isNumericString(v_price))  throw new Error('Price must be a number');
        if (!isNumeric(v_stock))        throw new Error('Stock must be a number');

        const clean_v_price = sanitizeNumericString(v_price) ?? '0';

        variant_array.push({
          id        : v_id,
          product_id: product_id,
          active    : v_stock >= 1 ? true : false,
          name      : clean_v_name,
          price     : clean_v_price,
          stock     : v_stock,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(sku ? { sku: sanitize(v_sku as string) } : {}),
        });
        variant_ids.push(v_id);
        variant_attachments.push(v_new_images);
      }

      const inactive_variant = variant_array.filter(v => v.active === false);

      if (inactive_variant.length === variant_array.length) product_active = false;

      /**
       * --------------------
       * 1.1. Insert product.
       * --------------------
       * 1. description (optional)
       * 2. by          (optional)
       * 3. price       (optional, since it has variants)
       * 4. stock       (optional, since it has variants)
       * 5. sku         (optional, since it has variants)
       */
      const _queryProduct = await db.product.insert({
        active     : product_active,
        id         : product_id,
        name       : clean_name,
        variants   : variant_ids,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        ...(description ? { description: sanitize(description) } : {}),
        ...(by ? { by: sanitize(by) } : {}),
      });

      /**
       * -----------------------------
       * 1.2. Product images handling.
       * -----------------------------
       */
      if (new_images && new_images.length) {
        if (!isImagesValid(new_images)) throw new Error('Invalid file types');

        const { thumbnails, images } = await compressProductImage(new_images);

        if (thumbnails.length) await addImages(thumbnails, _queryProduct as RxDocument<unknown>);
        if (images.length)     await addImages(images, _queryProduct as RxDocument<unknown>);
      }

      /**
       * ----------------------------
       * 1.3 Insert product variants.
       * ----------------------------
       */
      const _variantQuery = await db.variant.bulkInsert(variant_array);
      const { success: variantQuerySuccess }  = _variantQuery;

      /**
       * -----------------------------
       * 1.4. Variant images handling.
       * -----------------------------
       */
      if (variantQuerySuccess.length) {
        for (const [index, variant] of variantQuerySuccess.entries()) {
          if (variant_attachments[index].length) {
            if (!isImagesValid(variant_attachments[index])) throw new Error('Invalid file type');

            const { thumbnails, images } = await compressProductImage(variant_attachments[index]);

            if (thumbnails.length) await addImages(thumbnails, variant as RxDocument<unknown>);
            if (images.length)     await addImages(images, variant as RxDocument<unknown>);
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
      const clean_price = sanitizeNumericString(price) ?? '0';
      const is_active   = stock >= 1 ? true : false;

      /**
       * --------------------
       * 2.1. Insert product.
       * --------------------
       * 1. description (optional)
       * 2. by          (optional)
       * 3. sku         (optional)
       */
      const _queryProduct = await db.product.insert({
        id         : product_id,
        active     : is_active,
        name       : clean_name,
        price      : clean_price,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        stock,
        ...(description ? { description: sanitize(description) } : {}),
        ...(by ? { by: sanitize(by) } : {}),
        ...(sku ? { sku: sanitize(sku) } : {}),
      });

      /**
       * -----------------------------
       * 2.2. Product images handling.
       * -----------------------------
       */
      if (new_images &&new_images.length) {
        if (!isImagesValid(new_images)) throw new Error('Invalid file type');

        const { thumbnails, images } = await compressProductImage(new_images);

        if (thumbnails.length) await addImages(thumbnails, _queryProduct as RxDocument<unknown>);
        if (images.length)     await addImages(images, _queryProduct as RxDocument<unknown>);
      }
    }
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
