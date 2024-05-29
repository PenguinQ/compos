import { blobToBase64String } from 'rxdb';
import type { RxDocument, RxAttachment } from 'rxdb';

import { db } from '@/database';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import { ProductDoc, VariantDoc } from '@/database/types';

type ImageData = {
  id: string;
  url: string;
};

type ProductData = ProductDoc & {
  images: ImageData[];
};

type VariantData = VariantDoc & {
  images: ImageData[];
};

type ProductDetailQuery = {
  id: string;
  normalizer?: (data: unknown) => void;
};

export type ProductDetailQueryReturn = Omit<ProductData, 'variants'> & {
  variants: VariantData[];
};

export default async ({ id, normalizer }: ProductDetailQuery) => {
  try {
    const _queryProduct = await db.product.findOne({ selector: { id } }).exec();

    if (!_queryProduct) throw 'Product not found.';

    const _queryVariants: RxDocument<VariantDoc>[] = await _queryProduct.populate('variants');

    /**
     * ---------------------------
     * 1. Set product detail data.
     * ---------------------------
     */
    const { variants, ...product_rest } = _queryProduct.toJSON();
    const product_attachments = _queryProduct.allAttachments();
    const images              = product_attachments.filter((att: RxAttachment<ProductDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
    const product_data        = { images: [], ...product_rest } as ProductData;

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
    const variants_data = <VariantData[]>[];

    for (const variant of _queryVariants) {
      const variant_json        = variant.toJSON();
      const variant_attachments = variant.allAttachments();
      const images              = variant_attachments.filter((att: RxAttachment<VariantDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
      const variant_data        = { images: [], ...variant_json } as VariantData;

      for (const image of images) {
        const { id, type } = image;
        const image_data   = await image.getData();
        const image_base64 = await blobToBase64String(image_data);

        variant_data.images.push({ id, url: `data:${type};base64,${image_base64}` });
      }

      variants_data.push(variant_data);
    }

    return {
      result: normalizer ? normalizer({
        variants: variants_data,
        ...product_data,
      }) : {
        variants: variants_data,
        ...product_data,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
