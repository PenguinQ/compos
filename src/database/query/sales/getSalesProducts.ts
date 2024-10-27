import { combineLatest } from 'rxjs';
import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { isVariant, isBundle } from '@/database/utils';
import { IMAGE_ID_PREFIX, THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { BundleDocProduct, ProductDoc, QueryParams } from '@/database/types';

type GetSalesProductsProduct = {
  id: string;
  product_id?: string;
  quantity?: number;
};

type ProductData = {
  id: string;
  product_id?: string;
  active: boolean;
  name: string;
  description?: string;
  by?: string;
  price: string;
  stock?: number;
  sku?: string;
  variants?: string[];
  products?: BundleDocProduct[];
  auto_price?: boolean;
  created_at: string;
  updated_at: string;
};

export type ObserveableDataBundleItem = {
  id: string;
  name: string;
  stock: number;
  quantity: number;
};

type ObserveableData = {
  active: boolean;
  id: string;
  images: string[];
  name: string;
  price: string;
  product_id?: string;
  quantity?: number;
  sku?: string;
  stock?: number;
  items?: ObserveableDataBundleItem[];
};

export type ObservableReturns = {
  data: ObserveableData[];
  data_count: number;
};

interface GetSalesProductsQuery extends Omit<QueryParams, 'page' | 'limit'> {
  products: GetSalesProductsProduct[];
}

export default async ({ products, normalizer }: GetSalesProductsQuery) => {
  try {
    /**
     * ------------------------
     * List all query promises.
     * ------------------------
     */
    const _queryProducts = products.map(product => db.product.findOne({ selector: { id: product.id } }).$);
    const _queryVariants = products.filter(product => isVariant(product.id)).map(variant => db.variant.findOne({ selector: { id: variant.id } }).$);
    const _queryBundle   = products.filter(product => isBundle(product.id)).map(bundle => db.bundle.findOne({ selector: { id: bundle.id } }).$);
    const _queries = [
      ..._queryProducts,
      ..._queryVariants,
      ..._queryBundle,
    ];

    const observeableProcessor = async (data: RxDocument<unknown>[]): Promise<ObservableReturns> => {
      const filtered_products = data.filter(Boolean) as RxDocument<ProductData>[];
      const products_data     = <ObserveableData[]>[];

      /**
       * -------------------------------
       * 1. Loop through sales products.
       * -------------------------------
       */
      for (const product of filtered_products) {
        /**
         * --------------------------------
         * 1.1. If the product is a bundle.
         * --------------------------------
         */
        if (isBundle(product.id)) {
          const { id, active, name, products, price  } = product;
          const bundle_images = <string[]>[];
          const bundle_items  = <ObserveableDataBundleItem[]>[];

          /**
           * ------------------------------------------------
           * 1.1.1. Loop through every product on the bundle.
           * ------------------------------------------------
           */
          for (const product of products!) {
            const { id, quantity } = product;

            /**
             * ---------------------------------------------------
             * 1.1.1.1. If the product in the bundle is a variant.
             * ---------------------------------------------------
             */
            if (isVariant(id)) {
              const _queryVariant = await db.variant.findOne(id).exec();

              if (!_queryVariant) throw 'Variant in the bundle not found.';

              const _queryProduct = await _queryVariant.populate('product_id');

              if (!_queryProduct) throw 'Main product of the variant in the bundle not found';

              const { name: product_name } = _queryProduct.toJSON();
              const { name: variant_name, stock } = _queryVariant.toJSON();
              const variant_attachments    = _queryVariant.allAttachments();
              const variant_images         = variant_attachments.filter(image => image.id.startsWith(THUMBNAIL_ID_PREFIX));

              for (const image of variant_images) {
                const { type } = image;
                const image_data   = await image.getData();
                const image_base64 = await blobToBase64String(image_data);

                bundle_images.push(`data:${type};base64,${image_base64}`);
              }

              bundle_items.push({ id, name: `${product_name} - ${variant_name}`, stock, quantity });
            }
            /**
             * -------------------------------------------------------
             * 1.1.1.1. If the product in the bundle is NOT a variant.
             * -------------------------------------------------------
             */
            else {
              const _queryProduct = await db.product.findOne(id).exec();

              if (!_queryProduct) throw 'Product in the bundle not found';

              const { name, stock } = _queryProduct.toJSON();
              const product_attachments = _queryProduct.allAttachments();
              const product_images      = product_attachments.filter(image => image.id.startsWith(THUMBNAIL_ID_PREFIX));

              for (const image of product_images) {
                const { type } = image;
                const image_data   = await image.getData();
                const image_base64 = await blobToBase64String(image_data);

                bundle_images.push(`data:${type};base64,${image_base64}`);
              }

              bundle_items.push({ id, name, stock, quantity });
            }
          }

          products_data.push({
            images  : bundle_images,
            items   : bundle_items,
            quantity: undefined,      // Quantity set to undefined because it follows the quantity the bundle item.
            stock   : undefined,      // Stock set to undefined because it follows the stock of the bundle item.
            sku     : '',             // SKU set to empty because bundle doesn't have an SKU of it's own.
            id,
            active,
            name,
            price,
          });
        }
        /**
         * ------------------------------------
         * 1.2. If the product is NOT a bundle.
         * ------------------------------------
         */
        else {
          const { id, product_id, active, name, stock, price, sku } = product;
          const attachments    = product.allAttachments();
          const images         = attachments.filter(image => image.id.startsWith(IMAGE_ID_PREFIX));
          const quantity       = products.filter(product => product.id === id)[0].quantity!;
          const product_images = [];
          let product_name     = name;

          for (const image of images) {
            const { type } = image;
            const image_data   = await image.getData();
            const image_base64 = await blobToBase64String(image_data);

            product_images.push(`data:${type};base64,${image_base64}`);
          }

          /**
           * ----------------------------------------------------------
           * 1.2. If the product is a variant, update the product name.
           * ----------------------------------------------------------
           */
          if (isVariant(id)) {
            const _queryProduct = await db.product.findOne({ selector: { id: product_id } }).exec();

            if (_queryProduct) product_name = `${_queryProduct.name} - ${name}`;
          }

          products_data.push({
            images: product_images,
            name  : product_name,
            id,
            product_id,
            active,
            stock,
            price,
            sku,
            quantity,
          });
        }
      }

      return {
        data      : products_data,
        data_count: products_data.length,
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
