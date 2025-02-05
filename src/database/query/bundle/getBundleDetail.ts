import { blobToBase64String } from 'rxdb';
import type { RxDocument, RxAttachment } from 'rxdb';

// Databases
import { db } from '@/database';
import { isVariant } from '@/database/utils';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import type { BundleDoc, ProductDoc, VariantDoc } from '@/database/types';

// Helpers
import createError from '@/helpers/createError';
import { ComPOSError } from '@/helpers/createError';

export type BundleDetailProductImage = {
  id: string;
  url: string;
};

export type BundleDetailProduct = Omit<ProductDoc, 'variants'> & {
  product_name?: string;
  images: BundleDetailProductImage[];
  quantity: number;
};

type GetBundleDetailQuery = {
  id: string;
  normalizer?: (data: unknown) => void;
};

export type GetBundleDetailQueryReturn = BundleDoc & {
  products: BundleDetailProduct[];
};

export default async ({ id, normalizer }: GetBundleDetailQuery) => {
  try {
    const _queryBundle = await db.bundle.findOne({ selector: { id } }).exec();

    if (!_queryBundle) throw createError('Bundle not found', { status: 404 });

    const { products, ...bundleData } = _queryBundle.toJSON();
    const products_list: BundleDetailProduct[] = [];

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
          images      : variant_images,
          product_name: p_name,
          quantity,
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

        products_list.push({
          images: product_images,
          quantity,
          ...product_json,
        });
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
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
