import { combineLatest } from 'rxjs';
import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { isVariant } from '@/database/utils';
import { IMAGE_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, QueryParams } from '@/database/types';

type GetSalesProductsProduct = {
  id: string;
  product_id: string;
  quantity: number;
};

type ProductData = Omit<ProductDoc, 'by' | 'description' | 'variants'> & {
  product_id?: string;
};

export type ObservableReturns = {
  id: string;
  product_id?: string;
  active: boolean,
  images: string[],
  name: string,
  stock: number,
  price: number,
  sku?: string,
};

interface GetSalesProducts extends Omit<QueryParams, 'page' | 'limit'> {
  products: GetSalesProductsProduct[];
}

export default async ({ products, normalizer }: GetSalesProducts) => {
  try {
    const _queryProducts = products.map(product => db.product.findOne({ selector: { id: product.id } }).$);
    const _queryVariants = products.filter(product => isVariant(product.id)).map(variant => db.variant.findOne({ selector: { id: variant.id } }).$);
    const _queries = [..._queryProducts, ..._queryVariants];

    const observeableProcessor = async (data: RxDocument<unknown>[]): Promise<object> => {
      const filtered_products = data.filter(Boolean);
      const products = [];

      for (const product of filtered_products) {
        const { id, product_id, active, name, stock, price, sku } = product as RxDocument<ProductData>;
        const attachments    = product.allAttachments();
        const images         = attachments.filter(image => image.id.startsWith(IMAGE_ID_PREFIX));
        const product_images = [];
        let product_name     = name;

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          product_images.push({ id, url: `data:${type};base64,${image_base64}` });
        }

        if (isVariant(id)) {
          const _queryProduct = await db.product.findOne({ selector: { id: product_id } }).exec();

          if (_queryProduct) product_name = `${_queryProduct.name} - ${name}`;
        }

        products.push({
          id,
          product_id,
          active,
          images: product_images,
          name: product_name,
          stock,
          price,
          sku,
        });
      }

      return {
        data      : products,
        data_count: products.length,
      };
    };

    return {
      observeable: true,
      result: combineLatest(_queries),
      observeableProcessor,
      normalizer,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
