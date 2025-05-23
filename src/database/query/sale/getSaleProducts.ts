import { RxAttachment, blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { isVariant, isBundle, isProduct } from '@/database/utils';
import { IMAGE_ID_PREFIX, THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { BundleDoc, ProductDoc, VariantDoc } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

interface GetSaleProductsParams {
  id: string;
  product_id?: string;
  quantity: number;
};

/**
 * ---
 * About ProductItem:
 * 1. "sku" is optional since the product type can be either product or variant, which each of those type can have an sku.
 */
type ProductItem = {
  id: string;
  name: string;
  price: string;
  stock: number;
  quantity: number;
  sku?: string;
};

/**
 * ---
 * About Product:
 * 1. "stock" is optional since if the product type is a bundle, the stock are following the bundle items stock.
 * 2. "sku" is optional since if the product type is a bundle, it doesn't have its own sku, but the bundle items are.
 * 3. "items" is optional since items exclusive to a bundle.
 */
type Product = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  price: string;
  stock?: number;
  quantity: number;
  sku?: string;
  items?: ProductItem[];
};

export type QueryReturn = {
  data: Product[];
  data_count: number;
};

export default async (products: GetSaleProductsParams[]) => {
  try {
    const filtered_products = [];
    const products_data     = [];

    for (const product of products) {
      const { id } = product;

      if (isProduct(id)) {
        const _queryProduct = await db.product.findOne(id).exec();

        if (_queryProduct) filtered_products.push(_queryProduct);
      } else if (isVariant(id)) {
        const _queryVariant = await db.variant.findOne(id).exec();

        if (_queryVariant) filtered_products.push(_queryVariant);
      } else {
        const _queryBundle = await db.bundle.findOne(id).exec();

        if (_queryBundle) filtered_products.push(_queryBundle);
      }
    }

    /**
     * ------------------------------
     * 1. Loop through sale products.
     * ------------------------------
     */
    for (const product of filtered_products.filter(Boolean)) {
      /**
       * --------------------------------
       * 1.1. If the product is a bundle.
       * --------------------------------
       */
      if (isBundle(product.id)) {
        const {
          products: bundle_products,
          id,
          active,
          name,
          price,
        } = product as RxDocument<BundleDoc>;
        const bundle_images   = <string[]>[];
        const bundle_items    = [];
        const bundle_quantity = products.find(product => product.id === id)!.quantity;

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

            if (!_queryVariant) throw new Error('Variant in the bundle not found');

            const _queryProduct = await _queryVariant.populate('product_id');

            if (!_queryProduct) throw new Error('Main product of the variant in the bundle not found');

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

            if (!_queryProduct) throw new Error('Product in the bundle not found');

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
              price: price!, // In this case, product without variant always have a price.
              stock: stock!, // In this case, product without variant always have a stock.
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
        const {
          id,
          active,
          name,
          stock,
          price,
          sku,
        } = product as RxDocument<ProductDoc> | RxDocument<VariantDoc>;
        const attachments    = product.allAttachments();
        const images         = (attachments as RxAttachment<unknown>[]).filter(image => image.id.startsWith(IMAGE_ID_PREFIX));
        const quantity       = products.find(product => product.id === id)!.quantity;
        const product_images = [];
        let   product_name   = name;

        for (const image of images) {
          const { type }     = image;
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
          price : price!, // In this case, either product nor variant always have a price.
          id,
          active,
          stock,
          quantity,
          ...(sku ? { sku } : {}),
        });
      }
    }

    return {
      data      : products_data,
      data_count: products_data.length,
    };

  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
