import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import { isBundle, isProduct, isVariant } from '@/database/utils';
import type { OrderDocProduct, ProductDoc } from '@/database/types';

// Helpers
import createError from '@/helpers/createError';
import { ComPOSError } from '@/helpers/createError';

/**
 * ---
 * About ProductItem:
 * 1. "sku" is optional since the product item type can be either product or variant, which each of those type can have an sku.
 */
type ProductItem = {
  id: string;
  name: string;
  quantity: number;
  sku?: string;
};

/**
 * ---
 * About Product:
 * 1. "product_id" is optional since the product type can be a variant.
 * 2. "sku" is optional since the product type can be either product or variant, which each of those type can have an sku, but bundle doesn't.
 */
type Product = {
  id: string;
  active: boolean;
  product_id?: string;
  images: string[];
  name: string;
  price: string;
  quantity: number;
  sku?: string;
  items?: ProductItem[];
};

/**
 * ---
 * About ProductSold:
 * 1. "sku" is optional since the product type can be either product or variant, which each of those type can have an sku, but bundle doesn't.
 * 2. "items" is optional since the product sold can be a product or variant that doesnt have items like bundle.
 */
type ProductSold = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total: string;
  sku?: string;
  items?: (ProductItem & { price: string; })[];
};

type Order = {
  id: string;
  canceled: boolean;
  name: string;
  products: OrderDocProduct[];
  tendered: string;
  change: string;
  total: string;
  note?: string;
};

/**
 * ---
 * About QueryReturn:
 * 1. "order_notes" is optional since the sale can have or not have order_notes.
 * 2. "initial_balance" is optional since the sale can have or not have balance.
 * 3. "final_balance" is optional since final_balance are tied to initial_balance; if there's no initial_balance, there's no final_balance.
 */
export type QueryReturn = {
  id: string;
  finished: boolean;
  name: string;
  order_notes?: string[];
  products: Product[];
  products_sold: ProductSold[];
  orders: Order[];
  initial_balance?: string;
  final_balance?: string;
  revenue: string;
  updated_at: string;
};

export default async (id: string) => {
  try {
    const _querySale = await db.sale.findOne({ selector: { id } }).exec();

    if (!_querySale) throw createError('Sale not found', { status: 404 });

    const {
      name,
      finished,
      order_notes,
      initial_balance,
      final_balance,
      revenue,
      products,
      products_sold,
      created_at,
      updated_at,
    }  = _querySale;

    /**
     * ----------------------------------------
     * 1. Get each product details in the sale.
     * ----------------------------------------
     */
    const products_data = [];

    for (const product of products) {
      const is_product = isProduct(product.id);
      const is_variant = isVariant(product.id);
      const is_bundle  = isBundle(product.id);

      if (is_product) {
        const _queryProduct = await db.product.findOne({ selector: { id: product.id } }).exec();

        if (!_queryProduct) throw new Error('Product not found');

        const { active, name, price, sku } = _queryProduct.toJSON();
        const product_attachments  = _queryProduct.allAttachments();
        const product_images       = product_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
        const product_data = {
          id        : product.id,
          product_id: '',
          images    : [] as string[],
          quantity  : product.quantity,
          price     : price!,
          active,
          name,
          ...(sku ? { sku } : {}),
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

        if (!_queryVariant) throw new Error('Variant not found');

        const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

        if (!_queryProduct) throw new Error('Variant main product not found');

        const {
          id    : variant_product_id,
          active: variant_product_active,
          name  : variant_product_name,
        } = _queryProduct.toJSON();
        const { name, price, sku } = _queryVariant.toJSON();
        const variant_attachments  = _queryVariant.allAttachments();
        const variant_images       = variant_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
        const product_data = {
          id        : product.id,
          product_id: variant_product_id,
          active    : variant_product_active,
          images    : [] as string[],
          name      : is_variant ? `${variant_product_name} - ${name}` : name,
          quantity  : product.quantity,
          price,
          ...(sku ? { sku } : {}),
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

        if (!_queryBundle) throw new Error('Bundle not found');

        const { active, name, price, products } = _queryBundle.toJSON();
        const bundle_images = [];
        const bundle_items  = [];

        for (const product of products) {
          const { id, quantity } = product;

          if (isProduct(id)) {
            const _queryProduct = await db.product.findOne(id).exec();

            if (!_queryProduct) throw new Error('Bundle product not found');

            const { name, sku } = _queryProduct.toJSON();
            const product_attachments = _queryProduct.allAttachments();
            const product_images      = product_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            for (const image of product_images) {
              const { type }     = image;
              const image_data   = await image.getData();
              const image_base64 = await blobToBase64String(image_data);

              bundle_images.push(`data:${type};base64,${image_base64}`);
            }

            bundle_items.push({
              id,
              name,
              quantity,
              ...(sku ? { sku } : {}),
            });
          } else if (isVariant(id)) {
            const _queryVariant = await db.variant.findOne(id).exec();

            if (!_queryVariant) throw new Error('Bundle variant not found')

            const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

            const { name: product_name } = _queryProduct.toJSON();
            const { name: variant_name, sku: variant_sku } = _queryVariant.toJSON();
            const variant_attachments = _queryVariant.allAttachments();
            const variant_images      = variant_attachments.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            for (const image of variant_images) {
              const { type }     = image;
              const image_data   = await image.getData();
              const image_base64 = await blobToBase64String(image_data);

              bundle_images.push(`data:${type};base64,${image_base64}`);
            }

            bundle_items.push({
              name: `${product_name} - ${variant_name}`,
              id,
              quantity,
              ...(variant_sku ? { sku: variant_sku } : {}),
            });
          }
        }

        products_data.push({
          id      : product.id,
          images  : bundle_images,
          quantity: product.quantity,
          items   : bundle_items,
          active,
          name,
          price,
        });
      }
    }

    /**
     * --------------------------------------
     * 2. Get each order details in the sale.
     * --------------------------------------
     */
    const _queryOrders = await db.order.find({
      selector: {
        sale_id: {
          $eq: id,
        },
      },
    }).exec();
    const orders_data = [];

    for (const order of _queryOrders) {
      const { id, canceled, name, products, tendered, change, total, note } = order.toJSON();
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
        products: order_products,
        id,
        canceled,
        name,
        tendered,
        change,
        total,
        ...(note ? { note } : {}),
      });
    }

    /**
     * --------------------------------------
     * 3. Get details for each products sold.
     * --------------------------------------
     */
    const products_sold_data = [];

    for (const product of products_sold) {
      const {
        name,
        id,
        price,
        sku,
        quantity,
        items,
        total,
      } = product;
      let   current_name  = name;
      const current_items = [];

      if (isProduct(id)) {
        const _queryProduct = await db.product.findOne(id).exec();

        if (_queryProduct) {
          const { name } = _queryProduct;

          if (name !== current_name) current_name = name;
        }
      } else if (isVariant(id)) {
        const _queryVariant = await db.variant.findOne(id).exec();

        if (_queryVariant) {
          const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

          const { name: product_name } = _queryProduct.toJSON();
          const { name: variant_name } = _queryVariant.toJSON();
          const combined_name          = `${product_name} - ${variant_name}`;

          if (combined_name !== current_name) current_name = combined_name;
        }
      } else if (isBundle(id)) {
        const _queryBundle = await db.bundle.findOne(id).exec();

        if (_queryBundle) {
          const { name }  = _queryBundle.toJSON();

          if (name !== current_name) current_name = name;

          for (const item of items!) {
            const { id, name, sku, ...itemRest } = item;
            let current_item_name = name;

            if (isProduct(id)) {
              const _queryItemProduct = await db.product.findOne(id).exec();

              if (_queryItemProduct) {
                const { name } = _queryItemProduct;

                if (name !== current_item_name) current_item_name = name;
              }
            } else if (isVariant(id)) {
              const _queryItemVariant = await db.variant.findOne(id).exec();

              if (_queryItemVariant) {
                const _queryItemProduct: RxDocument<ProductDoc> = await _queryItemVariant.populate('product_id');

                const { name: item_product_name } = _queryItemProduct.toJSON();
                const { name: item_variant_name } = _queryItemVariant.toJSON();
                const combined_item_name          = `${item_product_name} - ${item_variant_name}`;

                if (combined_item_name !== current_item_name) current_item_name = combined_item_name;
              }
            }

            current_items.push({
              name: current_item_name,
              id,
              ...(sku ? { sku } : {}),
              ...itemRest,
            });
          }
        }
      }

      products_sold_data.push({
        name: current_name,
        id,
        price,
        quantity,
        total,
        ...(sku ? { sku } : {}),
        ...(items ? { items: current_items } : {}),
      });
    }

    return {
      products     : products_data,
      products_sold: products_sold_data,
      orders       : orders_data,
      order_notes,
      id,
      name,
      finished,
      initial_balance,
      final_balance,
      revenue,
      created_at,
      updated_at,
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
