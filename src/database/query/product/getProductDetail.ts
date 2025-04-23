import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

// Helpers
import createError, { ComPOSError } from '@/helpers/createError';

export type Product = Omit<ProductDoc, 'variants'> & {
  images: {
    id: string;
    url: string;
  }[];
};

export type Variant = VariantDoc & {
  images: {
    id: string;
    url: string;
  }[];
}

export type QueryReturn = Product & {
  variants?: Variant[];
};

export default async (id: string) => {
  try {
    const _queryProduct = await db.product.findOne({ selector: { id } }).exec();

    if (!_queryProduct) throw createError('Product not found', { status: 404 });

    /**
     * ---------------------------
     * 1. Set product detail data.
     * ---------------------------
     */
    const { variants, ...product_rest } = _queryProduct.toJSON();;
    const product_attachments = _queryProduct.allAttachments();
    const images              = product_attachments.filter(att => att.id.startsWith(IMAGE_ID_PREFIX));
    const product_data        = { images: [], ...product_rest } as Product;

    for (const image of images) {
      const { id, type } = image;
      const image_data   = await image.getData();
      const image_base64 = await blobToBase64String(image_data);

      product_data.images.push({ id, url: `data:${type};base64,${image_base64}` });
    }

    /**
     * ---------------------------
     * 2. Set variant detail data.
     * ---------------------------
     */
    const variants_data = [];

    if (variants) {
      const _queryVariants: RxDocument<VariantDoc>[] = await _queryProduct.populate('variants');

      for (const variant of _queryVariants) {
        const variant_json        = variant.toJSON();
        const variant_attachments = variant.allAttachments();
        const images              = variant_attachments.filter(att => att.id.startsWith(IMAGE_ID_PREFIX));
        const variant_data        = { images: [], ...variant_json } as Variant;

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          variant_data.images.push({ id, url: `data:${type};base64,${image_base64}` });
        }

        variants_data.push(variant_data);
      }
    }

    return {
      ...product_data,
      ...(variants ? { variants: variants_data } : {}),
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
