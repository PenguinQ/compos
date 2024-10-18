import { blobToBase64String } from 'rxdb';
import type { RxAttachment, RxDocument, DeepReadonly } from 'rxdb';

import { db } from '@/database';
import { PRODUCT_ID_PREFIX, VARIANT_ID_PREFIX, THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { OrderDoc, ProductDoc, SalesDocProduct } from '@/database/types';

export type ProductData = {
  id: string;
  product_id?: string;
  images: string[];
  name: string;
  price: number;
  quantity: number;
  sku: string;
};

export type ProductSoldData = {
  id: string;
  name: string;
  images: string[];
  quantity: number;
  subtotal: number;
};

export type OrderData = DeepReadonly<OrderDoc>;

export type SalesDetailQueryReturn = {
  id: string;
  finished: boolean;
  name: string;
  products: ProductData[];
  products_sold: ProductSoldData[];
  orders: OrderData[];
  revenue: number;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  created_at: string;
  updated_at: string;
};

type SalesDetailQuery = {
  id: string;
  normalizer?: (data: unknown) => void;
};

export default async ({ id, normalizer }: SalesDetailQuery) => {
  try {
    const _querySales = await db.sales.findOne({ selector: { id } }).exec();

    if (!_querySales) throw 'Sales not found.';

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
    const products_data = <ProductData[]>[];

    for (const product of products) {
      let _queryProduct;
      let is_variant           = false;
      let variant_product_id   = '';
      let variant_product_name = '';

      if (product.id.startsWith(PRODUCT_ID_PREFIX)) {
        _queryProduct = await db.product.findOne({ selector: { id: product.id } }).exec();
      } else if (product.id.startsWith(VARIANT_ID_PREFIX)) {
        _queryProduct = await db.variant.findOne({ selector: { id: product.id } }).exec();
        is_variant    = true;
      }

      if (!_queryProduct) throw 'Product not found.';

      /**
       * ---------------------------------
       * 1.1 Get the variant product name.
       * ---------------------------------
       * If the product is a variant, get the variant product name.
       */
      if (is_variant) {
        const _queryName: RxDocument<ProductDoc> = await _queryProduct.populate('product_id');

        if (!_queryName) throw 'Product for the variant not found.';

        variant_product_id   = _queryName.toJSON().id;
        variant_product_name = _queryName.toJSON().name;
      }

      const { name, price, sku } = _queryProduct.toJSON();
      const product_attachments  = _queryProduct.allAttachments()
      const images               = (product_attachments as RxAttachment<unknown>[]).filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
      const product_data: ProductData = {
        id        : product.id,
        product_id: variant_product_id,
        images    : [],
        name      : is_variant ? `${variant_product_name} - ${name}` : name,
        quantity  : product.quantity,
        sku       : sku ? sku : '',
        price,
      };

      for (const image of images) {
        const { type }     = image;
        const image_data   = await image.getData();
        const image_base64 = await blobToBase64String(image_data);

        product_data.images.push(`data:${type};base64,${image_base64}`);
      }

      products_data.push(product_data);
    }

    /**
     * -----------------------------------------
     * 2. Get details for each order in a sales.
     * -----------------------------------------
     */
    const _queryOrders: RxDocument<OrderDoc>[] = await _querySales.populate('orders');
    const orders_data = <OrderData[]>[];

    for (const order of _queryOrders) {
      const order_json = order.toJSON();

      orders_data.push(order_json);
    }

    /**
     * ------------------------------------------------------------------
     * 3. Calculate the number of products sold based on completed orders
     * ------------------------------------------------------------------
     */

    return {
      result: normalizer ? normalizer({
        id,
        name,
        finished,
        revenue,
        products: products_data,
        products_sold, // UNFINISHED
        order: orders_data,
        created_at,
        updated_at,
      }) : {
        id,
        name,
        finished,
        revenue,
        products: products_data,
        products_sold, // UNFINISHED
        order: orders_data,
        created_at,
        updated_at,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
