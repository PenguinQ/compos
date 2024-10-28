import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import { isBundle, isProduct, isVariant } from '@/database/utils';
import type { QueryParams, OrderDocProduct, ProductDoc } from '@/database/types';

type SalesDetailBundleProduct = {
  id: string;
  product_id?: string;
  images: string[]
  name: string;
  price: string;
  quantity: number;
  sku?: string;
};

export type SalesDetailProduct = {
  id: string;
  product_id?: string;
  images: string[];
  name: string;
  price: string;
  quantity?: number;
  sku?: string;
  products?: SalesDetailBundleProduct[];
};

export type SalesDetailProductSold = {
  id: string;
  name: string;
  images: string[];
  quantity: number;
  subtotal: number;
};

export type SalesDetailOrder = {
  id: string;
  name: string;
  products: OrderDocProduct[];
  tendered: string;
  change: string;
  total: string;
};

export type SalesDetailQueryReturn = {
  id: string;
  finished: boolean;
  name: string;
  products: SalesDetailProduct[];
  products_sold: SalesDetailProductSold[];
  orders: SalesDetailOrder[];
  revenue: string;
  updated_at: string;
};

type GetSalesDetailQuery = Omit<QueryParams, 'limit' | 'observe' | 'page' | 'sort'> & {
  id: string;
};

export default async ({ id, normalizer }: GetSalesDetailQuery) => {
  try {
    const _querySales = await db.sales.findOne({ selector: { id } }).exec();

    if (!_querySales) throw `Cannot find sales with id ${id}.`;

    const {
      name,
      finished,
      revenue,
      products,
      products_sold,
      created_at,
      updated_at,
    }  = _querySales;

    /**
     * -------------------------------------------
     * 1. Get details for each product in a sales.
     * -------------------------------------------
     * Since product id in sales can be either product id, or variant id, populate can't be used here,
     * instead we query each of the product based on the type of the id.
     */
    const products_data = <SalesDetailProduct[]>[];

    for (const product of products) {
      const is_product = isProduct(product.id);
      const is_variant = isVariant(product.id);
      const is_bundle  = isBundle(product.id);

      if (is_product) {
        const _queryProduct = await db.product.findOne({ selector: { id: product.id } }).exec();

        if (!_queryProduct) throw 'Product not found.';

        const { name, price, sku } = _queryProduct.toJSON();
        const product_attachments  = _queryProduct.allAttachments();
        const product_images       = product_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
        const product_data: SalesDetailProduct = {
          id        : product.id,
          product_id: '',
          images    : [],
          quantity  : product.quantity,
          sku       : sku ? sku : '',
          name,
          price,
        };

        for (const image of product_images) {
          const { type }     = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          product_data.images.push(`data:${type};base64,${image_base64}`);
        }

        products_data.push(product_data);
      } else if (is_variant) {
        const _queryVariant = await db.variant.findOne({ selector: { id: product.id } }).exec();

        if (!_queryVariant) throw 'Variant not found.';

        const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

        if (!_queryProduct) throw 'Variant main product not found.';

        const { id: variant_product_id, name: variant_product_name } = _queryProduct.toJSON();
        const { name, price, sku } = _queryVariant.toJSON();
        const variant_attachments  = _queryVariant.allAttachments();
        const variant_images       = variant_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
        const product_data: SalesDetailProduct = {
          id        : product.id,
          product_id: variant_product_id,
          images    : [],
          name      : is_variant ? `${variant_product_name} - ${name}` : name,
          quantity  : product.quantity,
          sku       : sku ? sku : '',
          price,
        };

        for (const image of variant_images) {
          const { type }     = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          product_data.images.push(`data:${type};base64,${image_base64}`);
        }

        products_data.push(product_data);
      } else if (is_bundle) {
        const _queryBundle = await db.bundle.findOne({ selector: { id: product.id } }).exec();

        if (!_queryBundle) throw 'Bundle not found.';

        const { name, price, products } = _queryBundle.toJSON();
        const bundle_images = [];

        for (const product of products) {
          const { id } = product;

          if (isProduct(id)) {
            const _queryProduct = await db.product.findOne(id).exec();

            if (!_queryProduct) throw 'Bundle product not found.'

            const product_attachments = _queryProduct.allAttachments();
            const product_images      = product_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            for (const image of product_images) {
              const { type }     = image;
              const image_data   = await image.getData();
              const image_base64 = await blobToBase64String(image_data);

              bundle_images.push(`data:${type};base64,${image_base64}`);
            }
          } else if (isVariant(id)) {
            const _queryVariant = await db.variant.findOne(id).exec();

            if (!_queryVariant) throw 'Bundle variant not found.'

            const variant_attachments = _queryVariant.allAttachments();
            const variant_images      = variant_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            for (const image of variant_images) {
              const { type }     = image;
              const image_data   = await image.getData();
              const image_base64 = await blobToBase64String(image_data);

              bundle_images.push(`data:${type};base64,${image_base64}`);
            }
          }
        }

        products_data.push({
          id        : product.id,
          images    : bundle_images,
          quantity  : product.quantity,
          name,
          price,
        });
      }
    }

    /**
     * -----------------------------------------
     * 2. Get details for each order in a sales.
     * -----------------------------------------
     */
    const _queryOrders = await db.order.find({
      selector: {
        sales_id: {
          $eq: id,
        },
      },
    }).exec();
    const orders_data = <SalesDetailOrder[]>[];

    for (const order of _queryOrders) {
      const { id, name, products, tendered, change, total } = order.toJSON();
      const order_products = [];

      for (const product of products) {
        const { id, name: old_name, price: old_price, quantity, total } = product;
        let name = old_name;

        const _queryProduct = await db.product.findOne(id).exec();

        if (_queryProduct) {
          const { name: new_name } = _queryProduct;

          name = new_name;
        }

        order_products.push({
          id,
          name,
          price: old_price,
          quantity,
          total,
        });
      }

      orders_data.push({
        id,
        name,
        products: order_products,
        tendered,
        change,
        total,
      });
    }

    /**
     * -------------------------------------------------------------------
     * 3. Calculate the number of products sold based on completed orders.
     * -------------------------------------------------------------------
     */
    return {
      result: normalizer ? normalizer({
        id,
        name,
        finished,
        revenue,
        products: products_data,
        products_sold, // UNFINISHED
        orders: orders_data,
        created_at,
        updated_at,
      }) : {
        id,
        name,
        finished,
        revenue,
        products: products_data,
        products_sold, // UNFINISHED
        orders: orders_data,
        created_at,
        updated_at,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
