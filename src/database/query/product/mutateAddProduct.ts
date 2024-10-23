import { monotonicFactory } from 'ulidx';
import { sanitize } from 'isomorphic-dompurify';
import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { VariantDoc } from '@/database/types';

// Helpers
import { isNumeric, sanitizeNumeric } from '@/helpers';

type MutateAddProductVariant = Partial<VariantDoc> & {
  new_image: File[];
};

type MutateAddProductQuery = {
  name: string;
  description?: string;
  by?: string;
  // OLD
  // price: number;
  price: string;
  stock: number;
  sku?: string;
  variants: MutateAddProductVariant[];
  new_image?: File[];
};

export default async (data: MutateAddProductQuery) => {
  try {
    const ulid       = monotonicFactory();
    const product_id = PRODUCT_ID_PREFIX + ulid();
    const {
      name,
      description,
      by,
      sku,
      price      = '0',
      stock      = 0,
      variants   = [],
      new_image  = [],
    } = data;
    const clean_name        = sanitize(name);
    const clean_description = description && sanitize(description);
    const clean_by          = by && sanitize(by);
    const clean_sku         = sku && sanitize(sku);

    if (clean_name.trim() === '') throw 'Product name cannot be empty.';
    if (!isNumeric(price))        throw 'Product price must be a number.';
    if (!isNumeric(stock))        throw 'Product stock must be a number.';

    // OLD
    // const clean_price = parseInt(price as unknown as string);
    // const clean_stock = parseInt(stock as unknown as string);
    const clean_price = sanitizeNumeric(price) as string;
    const clean_stock = sanitizeNumeric(stock) as number;
    const is_active   = clean_stock >= 1 ? true : false;

    /**
     * ----------------------
     * 1. With variants flow.
     * ----------------------
     */
    if (variants.length) {
      let product_active                  = true;
      const variant_ids: string[]         = [];
      const variant_array: VariantDoc[]   = [];
      const variant_attachments: File[][] = [];

      for (const variant of variants) {
        const v_id = VARIANT_ID_PREFIX + ulid();
        const {
          name     : v_name      = '',
          sku      : v_sku       = '',
          price    : v_price     = 0,
          stock    : v_stock     = 0,
          new_image: v_new_image = [],
        } = variant;
        const clean_v_name = sanitize(v_name);
        const clean_v_sku  = sanitize(v_sku);

        if (clean_v_name.trim() === '') throw 'Variant name cannot be empty.';
        if (!isNumeric(v_price))        throw 'Price must be a number.';
        if (!isNumeric(v_stock))        throw 'Stock must be a number.';

        // OLD
        // const clean_v_price = parseInt(v_price as unknown as string);
        // const clean_v_stock = parseInt(v_stock as unknown as string);
        const clean_v_price = sanitizeNumeric(v_price) as string;
        const clean_v_stock = sanitizeNumeric(v_stock) as number;

        variant_array.push({
          id        : v_id,
          product_id: product_id,
          active    : v_stock >= 1 ? true : false,
          name      : clean_v_name,
          sku       : clean_v_sku,
          price     : clean_v_price,
          stock     : clean_v_stock,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        variant_ids.push(v_id);
        variant_attachments.push(v_new_image);
      }

      const inactive_variant = variant_array.filter(v => v.active === false);

      if (inactive_variant.length === variant_array.length) product_active = false;

      /**
       * --------------------
       * 1.1. Insert product.
       * --------------------
       */
      const _queryProduct = await db.product.insert({
        active     : product_active,
        id         : product_id,
        name       : clean_name,
        description: clean_description,
        by         : clean_by,
        sku        : clean_sku,
        price      : '0',
        stock      : 0,
        variants   : variant_ids,
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
        for (const [index, variant] of variants.entries()) {
          if (variant_attachments[index].length) {
            if (!isImagesValid(variant_attachments[index])) throw 'Invalid file types.';

            const { thumbnails, images } = await compressProductImage(variant_attachments[index]);

            if (thumbnails.length) await addImages(thumbnails, variant as unknown as RxDocument<unknown>);
            if (images.length)     await addImages(images, variant as unknown as  RxDocument<unknown>);
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
        active     : is_active,
        id         : product_id,
        name       : clean_name,
        description: clean_description,
        by         : clean_by,
        sku        : clean_sku,
        price      : clean_price,
        stock      : clean_stock,
        variants   : [],
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
      });

      /**
       * -----------------------------
       * 2.2. Product images handling.
       * -----------------------------
       */
      if (new_image.length) {
        if (!isImagesValid(new_image)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_image);

        if (thumbnails.length) await addImages(thumbnails, _queryProduct as RxDocument<unknown>);
        if (images.length)     await addImages(images, _queryProduct as RxDocument<unknown>);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
