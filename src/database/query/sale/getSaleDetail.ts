import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import { isBundle, isProduct, isVariant } from '@/database/utils';
import type { QueryParams, OrderDocProduct, ProductDoc } from '@/database/types';

// Helpers
import createError from '@/helpers/createError';
import { ComPOSError } from '@/helpers/createError';

type SaleDetailBundleItem = {
  id: string;
  name: string;
  quantity: number;
  sku?: string;
};

export type SaleDetailProduct = {
  id: string;
  active: boolean;
  product_id?: string;
  images: string[];
  name: string;
  price: string;
  quantity: number;
  sku?: string;
  items?: SaleDetailBundleItem[];
};

type SaleDetailProductSoldItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  sku?: string;
};

export type SaleDetailProductSold = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total: string;
  sku?: string;
  items?: SaleDetailProductSoldItem[];
};

export type SaleDetailOrder = {
  id: string;
  name: string;
  products: OrderDocProduct[];
  tendered: string;
  change: string;
  total: string;
};

export type SaleDetailQueryReturn = {
  id: string;
  finished: boolean;
  name: string;
  products: SaleDetailProduct[];
  products_sold: SaleDetailProductSold[];
  orders: SaleDetailOrder[];
  initial_balance?: string;
  final_balance?: string;
  revenue: string;
  updated_at: string;
};

type GetSaleDetailQuery = Omit<QueryParams, 'limit' | 'observe' | 'page' | 'sort'> & {
  id: string;
};

export default async ({ id, normalizer }: GetSaleDetailQuery) => {
  try {
    const _querySale = await db.sale.findOne({ selector: { id } }).exec();

    if (!_querySale) throw createError('Sale not found', { status: 404 });

    const {
      name,
      finished,
      initial_balance,
      final_balance,
      revenue,
      products,
      products_sold,
      created_at,
      updated_at,
    }  = _querySale;

    /**
     * ------------------------------------------
     * 1. Get details for each product in a sale.
     * ------------------------------------------
     * Since product id in sale can be either product id, or variant id, populate can't be used here,
     * instead we query each of the product based on the type of the id.
     */
    const products_data = <SaleDetailProduct[]>[];

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
        const product_data: SaleDetailProduct = {
          id        : product.id,
          product_id: '',
          images    : [],
          quantity  : product.quantity,
          sku       : sku ? sku : '',
          price     : price!,           // Since it's a product without a variant, it's expected to have a price.
          active,
          name,
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
        const product_data: SaleDetailProduct = {
          id        : product.id,
          product_id: variant_product_id,
          active    : variant_product_active,
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
              ...(sku ? { sku} : {}),
            });
          } else if (isVariant(id)) {
            const _queryVariant = await db.variant.findOne(id).exec();

            if (!_queryVariant) throw new Error('Bundle variant not found')

            const _queryProduct: RxDocument<ProductDoc> = await _queryVariant.populate('product_id');

            const { name: product_name } = _queryProduct.toJSON();
            const { name: variant_name, sku } = _queryVariant.toJSON();
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
              ...(sku ? { sku} : {}),
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
     * ----------------------------------------
     * 2. Get details for each order in a sale.
     * ----------------------------------------
     */
    const _queryOrders = await db.order.find({
      selector: {
        sale_id: {
          $eq: id,
        },
      },
    }).exec();
    const orders_data = <SaleDetailOrder[]>[];

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
     * -------------------------------------
     * 3. Get details of each sold products.
     * -------------------------------------
     */
    const products_sold_data = <SaleDetailProductSold[]>[];

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
      const current_items = [] as SaleDetailProductSoldItem[];

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
              id,
              name: current_item_name,
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
      result: normalizer ? normalizer({
        products     : products_data,
        products_sold: products_sold_data,
        orders       : orders_data,
        id,
        name,
        finished,
        initial_balance,
        final_balance,
        revenue,
        created_at,
        updated_at,
      }) : {
        products     : products_data,
        products_sold: products_sold_data,
        orders       : orders_data,
        id,
        name,
        finished,
        initial_balance,
        final_balance,
        revenue,
        created_at,
        updated_at,
      },
    }
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
