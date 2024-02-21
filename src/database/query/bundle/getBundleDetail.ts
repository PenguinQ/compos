import { blobToBase64String } from 'rxdb';
import type { RxDocument, RxAttachment } from 'rxdb';

import { db } from '@/database';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

export default async ({ id, normalizer }: any): Promise<any> => {
  try {
    const _queryBundle = await db.bundle.findOne({ selector: { id } }).exec();

    if (!_queryBundle) throw { code: 404, message: 'Bundle not found.' };

    const { product: products, ...bundleData } = _queryBundle.toJSON();
    const product_list: any = [];

    /**
     * ---------------------------
     * 1. Set bundle product data.
     * ---------------------------
     */
    for (const product of products) {
      const { id, variant_id } = product;

      /**
       * ---------------------------------
       * 1.1 Flow if product is a variant.
       * ---------------------------------
       */
      if (variant_id) {
        const _queryVariant = await db.variant.findOne({ selector: { id: variant_id } }).exec();

        if (!_queryVariant) continue;

        const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

        if (!_queryProduct) continue;

        const { name: p_name }     = _queryProduct.toJSON();
        const variant_json         = _queryVariant.toJSON();
        const variant_attachments  = _queryVariant.allAttachments();
        const images               = variant_attachments.filter((att: RxAttachment<VariantDoc>) => att.id.startsWith(IMAGE_ID_PREFIX));
        const variant_images       = [];

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          variant_images.push({ id, data: `data:${type};base64,${image_base64}` });
        }

        product_list.push({ product_name: p_name, image: variant_images, ...variant_json });
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

          product_images.push({ id, data: `data:${type};base64,${image_base64}` });
        }

        product_list.push({ image: product_images, ...product_json });
      }
    }

    return {
      result: normalizer({ product: product_list, ...bundleData }),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
