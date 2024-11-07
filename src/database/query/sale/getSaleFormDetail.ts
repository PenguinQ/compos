import { blobToBase64String } from 'rxdb';

import { db } from '@/database';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import { isBundle, isProduct, isVariant } from '@/database/utils';
import type { QueryParams } from '@/database/types';

export type SaleFormDetailProduct = {
  id: string;
  images: string[];
  name: string;
  quantity: number;
};

export type SaleFormDetailReturn = {
  id: string;
  name: string;
  initial_balance?: string;
  products: SaleFormDetailProduct[];
};

type SaleFormDetailQuery = Omit<QueryParams, 'limit' | 'observe' | 'page' | 'sort'> & {
  id: string;
};

export default async ({ id, normalizer }: SaleFormDetailQuery) => {
  try {
    const _querySale = await db.sale.findOne({ selector: { id } }).exec();

    if (!_querySale) throw `Cannot find sale with id ${id}.`;

    const { name, initial_balance, products } = _querySale;
    const product_list = [];

    for (const product of products) {
      const { id, quantity } = product;
      const is_product = isProduct(id);
      const is_variant = isVariant(id);
      const is_bundle  = isBundle(id);

      if (is_product) {
        const _queryProduct = await db.product.findOne(id).exec();

        if (!_queryProduct) throw `The product with id ${id} does not exist.`;

        const { name } = _queryProduct;
        const attachments = _queryProduct.allAttachments();
        const images      = attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
        const data = {
          id,
          images: <string[]>[],
          name,
          quantity,
        };

        for (const image of images) {
          const { type }     = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          data.images.push(`data:${type};base64,${image_base64}`);
        }

        product_list.push(data);
      } else if (is_variant) {
        const _queryVariant = await db.variant.findOne(id).exec();

        if (!_queryVariant) throw `The product with id ${id} does not exist.`;

        const _queryProduct = await _queryVariant.populate('product_id');

        if (!_queryProduct) throw `The product with id ${id} does not exist.`;

        const { name: product_name } = _queryProduct;
        const { name: variant_name } = _queryVariant;
        const attachments = _queryVariant.allAttachments();
        const images      = attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
        const data = {
          id,
          images: <string[]>[],
          name: `${product_name} - ${variant_name}`,
          quantity,
        };

        for (const image of images) {
          const { type }     = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          data.images.push(`data:${type};base64,${image_base64}`);
        }

        product_list.push(data);
      } else if (is_bundle) {
        const _queryBundle = await db.bundle.findOne(id).exec();

        if (!_queryBundle) throw `The product with id ${id} does not exist.`;

        const { name, products } = _queryBundle;
        const data = {
          id,
          images: <string[]>[],
          name,
          quantity,
        };

        for (const product of products) {
          const { id } = product;

          if (isProduct(id)) {
            const _queryProduct = await db.product.findOne(id).exec();

            if (!_queryProduct) throw `The product with id ${id} does not exist.`;

            const attachments = _queryProduct.allAttachments();
            const images      = attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            for (const image of images) {
              const { type }     = image;
              const image_data   = await image.getData();
              const image_base64 = await blobToBase64String(image_data);

              data.images.push(`data:${type};base64,${image_base64}`);
            }
          } else if (isVariant(id)) {
            const _queryVariant = await db.variant.findOne(id).exec();

            if (!_queryVariant) throw `The product with id ${id} does not exist.`;

            const attachments = _queryVariant.allAttachments();
            const images      = attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            for (const image of images) {
              const { type }     = image;
              const image_data   = await image.getData();
              const image_base64 = await blobToBase64String(image_data);

              data.images.push(`data:${type};base64,${image_base64}`);
            }
          }
        }

        product_list.push(data);
      }
    }

    return {
      result: normalizer ? normalizer({
        id,
        name,
        initial_balance,
        products: product_list,
      }) : {
        id,
        name,
        initial_balance,
        products: product_list,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
