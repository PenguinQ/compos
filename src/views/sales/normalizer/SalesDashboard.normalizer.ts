import type { SalesDetailQueryReturn } from '@/database/query/sales/getSalesDetail';
import type {
  ObservableReturns as ProductsQueryReturns,
  ObserveableDataItem,
} from '@/database/query/sales/getSalesProducts';
import type {
  ObservableReturns as OrdersQueryReturns,
} from '@/database/query/sales/getSalesOrders';

import { getUpdateTime, toIDR } from '@/helpers';

export type DetailsNormalizerProduct = {
  id: string;
  product_id?: string;
  quantity?: number;
};

type ProductsNormalizerItem = ObserveableDataItem & {
  priceFormatted: string;
};

type ProductsNormalizerProduct = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  price: string;
  priceFormatted: string;
  // Optional since the product can be a bundle, and bundle items has it's own stock.
  stock?: number;
  // Optional since the product can be a bundle, and bundle items has it's own quantity.
  quantity?: number;
  // Optional since the product can be a bundle, and bundle items has it's own sku.
  sku?: string;
  // Optional since items only for bundle.
  items?: ProductsNormalizerItem[];
};

type OrdersNormalizerOrder = {

};

export type DetailsNormalizerReturn = {
  name: string;
  finished: boolean;
  products: DetailsNormalizerProduct[];
  updatedAt: string;
};

export type ProductsNormalizerReturn = {
  products: ProductsNormalizerProduct[];
  productsCount: number;
};

export type OrdersNormalizerReturn = {
  orders: OrdersNormalizerOrder[];
  ordersCount: number;
};

export const detailsNormalizer = (data: unknown): DetailsNormalizerReturn => {
  const { finished, name, products, updated_at } = data as SalesDetailQueryReturn || {};
  const salesProducts: { id: string, product_id?: string, quantity?: number }[] = [];

  for (const product of products) {
    const { id, product_id, quantity } = product;

    salesProducts.push({ id, product_id, quantity });
  }

  return {
    products : salesProducts,
    updatedAt: getUpdateTime(updated_at),
    name,
    finished,
  };
};

export const productsNormalizer = (data: unknown): ProductsNormalizerReturn => {
  const { data: productsData, data_count } = data as ProductsQueryReturns;
  const productList = <ProductsNormalizerProduct[]>[];

  for (const product of productsData) {
    const {
      active,
      id,
      images,
      name,
      price,
      quantity,
      sku,
      stock,
      items,
    } = product;
    let itemList = [];

    if (items) {
      for (const item of items) {
        const { id, name, price, quantity, sku, stock } = item;

        itemList.push({
          priceFormatted: toIDR(price),
          id,
          name,
          price,
          quantity,
          sku,
          stock,
        });
      }
    }


    productList.push({
      items          : itemList.length ? itemList : undefined,
      priceFormatted: toIDR(price),
      id,
      active,
      images,
      name,
      sku,
      price,
      stock,
      quantity,
    });
  }

  return {
    products     : productList,
    productsCount: data_count,
  };
};

export const ordersNormalizer = (data: unknown): OrdersNormalizerReturn => {
  const { data: ordersData, data_count } = data as OrdersQueryReturns;
  const ordersList = [];

  for (const order of ordersData) {
    const { id, canceled, name, products, total, tendered, change } = order;
    const orderProductList = [];

    for (const product of products) {
      const { name, quantity, items } = product;
      const itemList = [];

      if (items) {
        for (const item of items) {
          const { name, quantity: item_quantity } = item;

          itemList.push({
            quantity: item_quantity * quantity,
            name,
          });
        }
      }

      orderProductList.push({
        items: itemList.length ? itemList : undefined,
        name,
        quantity,
      });
    }

    ordersList.push({
      products: orderProductList,
      id,
      canceled,
      name,
      total,
      totalFormatted: toIDR(total),
      tendered,
      tenderedFormatted: toIDR(tendered),
      change,
      changeFormatted: toIDR(change),
    });
  }

  return {
    orders     : ordersList,
    ordersCount: data_count,
  };
};
