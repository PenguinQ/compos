import { monotonicFactory } from 'ulidx';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { VariantDoc } from '@/database/types';
import { compressProductImage } from '@/database/utils';

interface ProductVariant extends VariantDoc {
  new_image?: File[];
}

type MutateAddProductData = {
  name: string;
  description?: string;
  by?: string;
  price: number;
  stock: number;
  sku?: string;
  variant: any[];
  new_image?: File[];
};

type MutateAddProductParams = {
  data: MutateAddProductData;
};

const addImages = async (images: any[], doc: RxDocument<any>) => {
  for (const image of images) {
    const { id, data } = image;
    const { type }     = data;

    await doc.putAttachment({ id, data, type });
  }
};

export default async ({ data }: MutateAddProductParams) => {
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

    /**
     * ----------------------
     * 1. With variants flow.
     * ----------------------
     */
    if (variant.length) {
      let is_active                         = true;
      const variant_array: ProductVariant[] = [];
      const variant_ids: string[]           = [];
      const variant_attachments: File[][]   = [];

      variant.map((v: ProductVariant) => {
        const v_id = VARIANT_ID_PREFIX + ulid();
        const {
          name: v_name,
          sku: v_sku,
          price: v_price         = 0,
          stock: v_stock         = 0,
          new_image: v_new_image = [],
        } = v;

        variant_array.push({
          id        : v_id,
          product_id: product_id,
          active    : v_stock >= 1 ? true : false,
          name      : v_name,
          price     : v_price,
          stock     : v_stock,
          sku       : v_sku,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        variant_ids.push(v_id);
        variant_attachments.push(v_new_image);
      });

      const inactiveVariant = variant_array.filter((v: ProductVariant) => v.active === false);

      if (inactiveVariant.length === variant_array.length) is_active = false;

      /**
       * --------------------
       * 1.1. Insert product.
       * --------------------
       */
      const _queryProduct = await db.product.insert({
        id         : product_id,
        active     : is_active,
        variant    : variant_ids,
        price      : 0,
        stock      : 0,
        sku        : data.sku,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        name,
        description,
        by,
      });

      /**
       * -----------------------------
       * 1.2. Product images handling.
       * -----------------------------
       */
      if (new_image.length) {
        const { thumbnail, macrograph } = await compressProductImage(new_image);

        if (thumbnail.length)  await addImages(thumbnail, _queryProduct);
        if (macrograph.length) await addImages(macrograph, _queryProduct);
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
            const { thumbnail, macrograph } = await compressProductImage(variant_attachments[index]);

            if (thumbnail.length)  await addImages(thumbnail, variant);
            if (macrograph.length) await addImages(macrograph, variant);
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
        name,
        description,
        by,
        price,
        stock,
        sku,
        id         : product_id,
        active     : stock >= 1 ? true : false,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        variant    : [],
      });

      /**
       * -----------------------------
       * 2.2. Product images handling.
       * -----------------------------
       */
      if (new_image.length) {
        const { thumbnail, macrograph } = await compressProductImage(new_image);

        if (thumbnail.length)  await addImages(thumbnail, _queryProduct);
        if (macrograph.length) await addImages(macrograph, _queryProduct);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
