import { blobToBase64String } from 'rxdb';
import type { DeepReadonly, RxDocument, RxAttachment } from 'rxdb';

import { db } from '@/database';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import { ProductDoc, QueryReturn, VariantDoc } from '@/database/types';

type ImageData = {
  id: string;
  data: string;
};

type ProductData = DeepReadonly<ProductDoc> & {
  image: ImageData[];
};

type VariantData = DeepReadonly<VariantDoc> & {
  image: ImageData[];
};

export type NormalizerData = {
  product: ProductData;
  variant: VariantData[];
};

type ProductDetailQuery = {
  id: string;
  normalizer?: (data: NormalizerData) => void;
};

export default async ({ id, normalizer }: ProductDetailQuery): Promise<QueryReturn> => {
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
    const product_data        = { image: [], ...product_json } as ProductData;

    for (const image of images) {
      const { id, type } = image;
      const image_data   = await image.getData();
      const image_base64 = await blobToBase64String(image_data);

      product_data.image.push({ id, data: `data:${type};base64,${image_base64}` });
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
      const variant_data        = { image: [], ...variant_json } as VariantData;

      for (const image of images) {
        const { id, type } = image;
        const image_data   = await image.getData();
        const image_base64 = await blobToBase64String(image_data);

        variant_data.image.push({ id, data: `data:${type};base64,${image_base64}` });
      }

      variants_data.push(variant_data);
    }

    return {
      result: normalizer ? normalizer({
        product: product_data,
        variant: variants_data,
      }) : {
        product: product_data,
        variant: variants_data,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
