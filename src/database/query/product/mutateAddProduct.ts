import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';
import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { VariantDoc } from '@/database/types';

// Helpers
import { isNumeric, sanitizeNumeric } from '@/helpers';

type MutateAddProductVariant = Partial<VariantDoc> & {
  new_images?: File[];
};

type MutateAddProductQuery = {
  name: string;
  description?: string;
  by?: string;
  price?: string;
  stock?: number;
  sku?: string;
  variants?: MutateAddProductVariant[];
  new_images?: File[];
};

export default async (data: MutateAddProductQuery) => {
  try {
    const { sanitize } = DOMPurify;
    const ulid       = monotonicFactory();
    const product_id = PRODUCT_ID_PREFIX + ulid();
    const {
      name  = '',
      price = '0',
      stock = 0,
      description,
      by,
      variants,
      new_images,
      sku,
    } = data;
    const clean_name = sanitize(name);

    if (clean_name.trim() === '')   throw 'Product name cannot be empty.';
    if (price && !isNumeric(price)) throw 'Product price must be a number.';
    if (stock && !isNumeric(stock)) throw 'Product stock must be a number.';

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

        if (clean_v_name.trim() === '') throw 'Variant name cannot be empty.';
        if (!isNumeric(v_price))        throw 'Price must be a number.';
        if (!isNumeric(v_stock))        throw 'Stock must be a number.';

        const clean_v_price = sanitizeNumeric(v_price) as string;
        const clean_v_stock = sanitizeNumeric(v_stock) as number;

        variant_array.push({
          id        : v_id,
          product_id: product_id,
          active    : v_stock >= 1 ? true : false,
          name      : clean_v_name,
          price     : clean_v_price,
          stock     : clean_v_stock,
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
       * 1. description is optional.
       * 2. by is optional.
       * 3. price is optional since it's a variant.
       * 4. stock is optional since it's a variant.
       * 5. sku is optional since it's a variant.
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
        if (!isImagesValid(new_images)) throw 'Invalid file types.';

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
            if (!isImagesValid(variant_attachments[index])) throw 'Invalid file types.';

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
      const clean_price = sanitizeNumeric(price!) as string;
      const clean_stock = sanitizeNumeric(stock!) as number;
      const is_active   = clean_stock >= 1 ? true : false;

      /**
       * --------------------
       * 2.1. Insert product.
       * --------------------
       * 1. description is optional.
       * 2. by is optional.
       * 3. sku is optional.
       */
      const _queryProduct = await db.product.insert({
        active     : is_active,
        id         : product_id,
        name       : clean_name,
        price      : clean_price,
        stock      : clean_stock,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
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
        if (!isImagesValid(new_images)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_images);

        if (thumbnails.length) await addImages(thumbnails, _queryProduct as RxDocument<unknown>);
        if (images.length)     await addImages(images, _queryProduct as RxDocument<unknown>);
      }
    }
  } catch (error) {
    if (error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
