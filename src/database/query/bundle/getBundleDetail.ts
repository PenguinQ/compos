import { blobToBase64String } from 'rxdb';
import type { DeepReadonly, RxDocument, RxAttachment } from 'rxdb';

import { db } from '@/database';
import { IMAGE_ID_PREFIX } from '@/database/constants';

// Helpers
import { isVariant } from '@/database/utils';

// Types
import type { BundleDoc, ProductDoc, VariantDoc } from '@/database/types';

export type ProductsListImages = {
  id: string;
  url: string;
};

export type ProductsList = DeepReadonly<ProductDoc> & {
  product_name?: string;
  images: ProductsListImages[];
  quantity: number;
};

type GetBundleDetailQuery = {
  id: string;
  normalizer?: (data: unknown) => void;
};

export type GetBundleDetailQueryReturn = BundleDoc & {
  products: ProductsList[];
};

export default async ({ id, normalizer }: GetBundleDetailQuery) => {
  try {
    const _queryBundle = await db.bundle.findOne({ selector: { id } }).exec();

    if (!_queryBundle) throw 'Bundle not found.';

    const { products, ...bundleData } = _queryBundle.toJSON();
    const products_list: ProductsList[] = [];

    /**
     * ---------------------------
     * 1. Set bundle product data.
     * ---------------------------
     */
    for (const product of products) {
      const { id, quantity } = product;
      /**
       * ---------------------------------
       * 1.1 Flow if product is a variant.
       * ---------------------------------
       */
      if (isVariant(id)) {
        const _queryVariant = await db.variant.findOne({ selector: { id } }).exec();

        if (!_queryVariant) continue;

        const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

        if (!_queryProduct) continue;

        const { name: p_name }    = _queryProduct.toJSON();
        const variant_json        = _queryVariant.toJSON();
        const variant_attachments = _queryVariant.allAttachments();
        const images              = variant_attachments.filter((att: RxAttachment<VariantDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
        const variant_images      = [];

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          variant_images.push({ id, url: `data:${type};base64,${image_base64}` });
        }

        products_list.push({
          quantity,
          product_name: p_name,
          images: variant_images,
          ...variant_json,
        });
      }
      /**
       * -------------------------------------
       * 1.2 Flow if product is not a variant.
       * -------------------------------------
       */
      else {
        const _queryProduct = await db.product.findOne({ selector: { id } }).exec();

        if (!_queryProduct) continue;

        const product_json        = _queryProduct.toJSON();
        const product_attachments = _queryProduct.allAttachments();
        const images              = product_attachments.filter((att: RxAttachment<ProductDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
        const product_images      = [];

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          product_images.push({ id, url: `data:${type};base64,${image_base64}` });
        }

        products_list.push({ quantity, images: product_images, ...product_json });
      }
    }

    return {
      result: normalizer ? normalizer({
        products: products_list,
        ...bundleData
      }): {
        products: products_list,
        ...bundleData
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
