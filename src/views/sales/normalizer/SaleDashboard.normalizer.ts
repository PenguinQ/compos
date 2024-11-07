import type { SaleDetailQueryReturn } from '@/database/query/sale/getSaleDetail';
import type { GetSaleProductsQueryReturn, GetSaleProductsBundleItem } from '@/database/query/sale/getSaleProducts';
import type { ObservableReturns as OrdersQueryReturns } from '@/database/query/sale/getSaleOrders';

import { getUpdateTime, toIDR } from '@/helpers';

export type DetailsNormalizerProduct = {
  id: string;
  product_id?: string;
  quantity?: number;
};

export type DetailsNormalizerReturn = {
  name: string;
  finished: boolean;
  products: DetailsNormalizerProduct[];
  balance?: string;
  updatedAt: string;
};

export const detailsNormalizer = (data: unknown): DetailsNormalizerReturn => {
  const { finished, name, products, initial_balance, updated_at } = data as SaleDetailQueryReturn || {};
  const saleProducts: { id: string, product_id?: string, quantity?: number }[] = [];

  for (const product of products) {
    const { id, product_id, quantity } = product;

    saleProducts.push({ id, product_id, quantity });
  }

  return {
    products : saleProducts,
    updatedAt: getUpdateTime(updated_at),
    name,
    finished,
    ...(initial_balance ? { balance: initial_balance } : {}),
  };
};

type ProductsNormalizerItem = GetSaleProductsBundleItem & {
  priceFormatted: string;
};

/**
 * --------------------------------------------------------------------------------------------------
 * 1. stock is optional since the product can be a bundle, and bundle items has it's own stock.
 * 2. sku is optional since the product can be a bundle, and bundle items has it's own sku.
 * 3. items is optional since items only used for bundle.
 * --------------------------------------------------------------------------------------------------
 */
export type ProductsNormalizerProduct = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  price: string;
  priceFormatted: string;
  stock?: number;
  quantity: number;
  sku?: string;
  items?: ProductsNormalizerItem[];
};

export type ProductsNormalizerReturn = {
  products: ProductsNormalizerProduct[];
  productsCount: number;
};

export const productsNormalizer = (data: unknown): ProductsNormalizerReturn => {
  const { data: productsData, data_count } = data as GetSaleProductsQueryReturn;
  const productList = [];

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
      priceFormatted : toIDR(price),
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

type OrdersNormalizerOrderProductItem = {
  name: string;
  quantity: number;
};

type OrdersNormalizerOrderProduct = {
  name: string;
  quantity: number;
  items?: OrdersNormalizerOrderProductItem[];
};

type OrdersNormalizerOrder = {
  products: OrdersNormalizerOrderProduct[],
  id: string;
  canceled: boolean;
  name: string;
  total: string;
  totalFormatted: string;
  tendered: string;
  tenderedFormatted: string;
  change: string;
  changeFormatted: string;
};

export type OrdersNormalizerReturn = {
  orders: OrdersNormalizerOrder[];
  ordersTotalChange: string;
  ordersTotalChangeFormatted: string;
  ordersCount: number;
};

export const ordersNormalizer = (data: unknown): OrdersNormalizerReturn => {
  const { data: ordersData, data_count } = data as OrdersQueryReturns;
  const { orders, orders_total_change }  = ordersData;
  const ordersList = [];

  for (const order of orders) {
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
      products         : orderProductList,
      totalFormatted   : toIDR(total),
      tenderedFormatted: toIDR(tendered),
      changeFormatted  : toIDR(change),
      id,
      canceled,
      name,
      total,
      tendered,
      change,
    });
  }

  return {
    orders                    : ordersList,
    ordersTotalChange         : orders_total_change,
    ordersTotalChangeFormatted: toIDR(orders_total_change),
    ordersCount               : data_count,
  };
};
