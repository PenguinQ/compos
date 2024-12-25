import { combineLatest } from 'rxjs';
import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { isVariant, isBundle, isProduct } from '@/database/utils';
import { IMAGE_ID_PREFIX, THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { BundleDocProduct, QueryParams } from '@/database/types';

type GetSaleProductsProduct = {
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

export type ObserveableDataItem = {
  id: string;
  name: string;
  price: string;
  stock: number;
  quantity: number;
  sku?: string;
};

/**
 * --------------------------------------------------------------------------------------------------
 * 1. stock is optional since the product can be a bundle, and bundle items has it's own stock.
 * 2. sku is optional since the product can be a bundle, and bundle items has it's own sku.
 * 3. items is optional since items only used for bundle.
 * --------------------------------------------------------------------------------------------------
 */
type ObserveableData = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  price: string;
  stock?: number;
  quantity: number;
  sku?: string;
  items?: ObserveableDataItem[];
};

export type ObservableReturns = {
  data: ObserveableData[];
  data_count: number;
};

interface GetSaleProductsQuery extends Omit<QueryParams, 'page' | 'limit' | 'sort'> {
  products: GetSaleProductsProduct[];
}

export default async ({ products, normalizer }: GetSaleProductsQuery) => {
  try {
    const _queryProducts = products.filter(product => isProduct(product.id)).map(product => db.product.findOne({ selector: { id: product.id } }).$);
    const _queryVariants = products.filter(product => isVariant(product.id)).map(variant => db.variant.findOne({ selector: { id: variant.id } }).$);
    const _queryBundle   = products.filter(product => isBundle(product.id)).map(bundle => db.bundle.findOne({ selector: { id: bundle.id } }).$);
    const _queries = [
      ..._queryProducts,
      ..._queryVariants,
      ..._queryBundle,
    ];

    const observeableProcessor = async (data: unknown): Promise<ObservableReturns> => {
      const filtered_products = (data as RxDocument<ProductData>[]).filter(Boolean);
      const products_data     = <ObserveableData[]>[];

      /**
       * ------------------------------
       * 1. Loop through sale products.
       * ------------------------------
       */
      for (const product of filtered_products) {
        /**
         * --------------------------------
         * 1.1. If the product is a bundle.
         * --------------------------------
         */
        if (isBundle(product.id)) {
          const { id, active, name, products: bundle_products, price  } = product;
          const bundle_images = <string[]>[];
          const bundle_items  = <ObserveableDataItem[]>[];
          const bundle_quantity = products!.filter(product => product.id === id)[0].quantity!;

          /**
           * ------------------------------------------------
           * 1.1.1. Loop through every product on the bundle.
           * ------------------------------------------------
           */
          for (const product of bundle_products!) {
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
              const { name: variant_name, price, stock, sku } = _queryVariant.toJSON();
              const variant_attachments = _queryVariant.allAttachments();
              const variant_images      = variant_attachments.filter(image => image.id.startsWith(THUMBNAIL_ID_PREFIX));

              for (const image of variant_images) {
                const { type }     = image;
                const image_data   = await image.getData();
                const image_base64 = await blobToBase64String(image_data);

                bundle_images.push(`data:${type};base64,${image_base64}`);
              }

              bundle_items.push({
                name: `${product_name} - ${variant_name}`,
                id,
                price,
                stock,
                quantity,
                ...(sku ? { sku } : {}),
              });
            }
            /**
             * -------------------------------------------------------
             * 1.1.1.1. If the product in the bundle is NOT a variant.
             * -------------------------------------------------------
             */
            else {
              const _queryProduct = await db.product.findOne(id).exec();

              if (!_queryProduct) throw 'Product in the bundle not found';

              const { name, price, stock, sku } = _queryProduct.toJSON();
              const product_attachments = _queryProduct.allAttachments();
              const product_images      = product_attachments.filter(image => image.id.startsWith(THUMBNAIL_ID_PREFIX));

              for (const image of product_images) {
                const { type }     = image;
                const image_data   = await image.getData();
                const image_base64 = await blobToBase64String(image_data);

                bundle_images.push(`data:${type};base64,${image_base64}`);
              }

              bundle_items.push({
                price: price!, // If the product is not a variant, it should be have a price.
                stock: stock!, // If the product is not a variant, it should be have a stock.
                id,
                name,
                quantity,
                ...(sku ? { sku } : {}),
              });
            }
          }

          products_data.push({
            images  : bundle_images,
            items   : bundle_items,
            quantity: bundle_quantity,
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
          const { id, active, name, stock, price, sku } = product;
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
            const _queryProduct = await product.populate('product_id');

            if (_queryProduct) product_name = `${_queryProduct.name} - ${name}`;
          }

          products_data.push({
            images: product_images,
            name  : product_name,
            id,
            active,
            stock,
            price,
            quantity,
            ...(sku ? { sku } : {}),
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
      result     : combineLatest(_queries),
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
