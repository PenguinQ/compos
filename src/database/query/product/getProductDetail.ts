import { blobToBase64String } from 'rxdb';
import type { RxDocument, RxAttachment } from 'rxdb';

import { db } from '@/database';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import { ProductDoc, VariantDoc } from '@/database/types';

type GetProductDetailParams = {
  id: string;
  normalizer?: (data: any) => void;
};

export default async ({ id, normalizer }: GetProductDetailParams) => {
  try {
    const _queryProduct = await db.product.findOne({ selector: { id } }).exec();

    if (!_queryProduct) throw { code: 404, message: 'Product not found.' };

    const _queryVariants: RxDocument<VariantDoc>[] = await _queryProduct.populate('variant');

    /**
     * ---------------------------
     * 1. Set product detail data.
     * ---------------------------
     */
    const product_json        = _queryProduct.toJSON();
    const product_attachments = _queryProduct.allAttachments();
    const images              = product_attachments.filter((att: RxAttachment<ProductDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
    const product_images: any = [];
    const product_data        = { image: product_images, ...product_json };

    for (const image of images) {
      const { id, type } = image;
      const image_data   = await image.getData();
      const image_base64 = await blobToBase64String(image_data);

      product_images.push({ id, data: `data:${type};base64,${image_base64}` });
    }

    /**
     * ---------------------------
     * 2. Set variant detail data.
     * ---------------------------
     */
    const variant_data = [];

    for (const variant of _queryVariants) {
      const variant_json        = variant.toJSON();
      const variant_attachments = variant.allAttachments();
      const images              = variant_attachments.filter((att: RxAttachment<VariantDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
      const variant_images      = [];


      for (const image of images) {
        const { id, type } = image;
        const image_data   = await image.getData();
        const image_base64 = await blobToBase64String(image_data);

        variant_images.push({ id, data: `data:${type};base64,${image_base64}` });
      }

      variant_data.push({ image: variant_images, ...variant_json });
    }

    return {
      result: normalizer ? normalizer({
        product: product_data,
        variant: variant_data,
      }) : {
        product: product_data,
        variant: variant_data,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
