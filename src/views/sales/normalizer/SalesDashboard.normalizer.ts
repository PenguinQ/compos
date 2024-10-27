import { getUpdateTime, toIDR } from '@/helpers';
import type { SalesDetailQueryReturn } from '@/database/query/sales/getSalesDetail';

import type {
  ObserveableDataBundleItem as ProductsNormalizerBundleItem,
  ObservableReturns as ProductsQueryReturns,
} from '@/database/query/sales/getSalesProducts';

export type DetailsNormalizerProduct = {
  id: string;
  product_id?: string;
  quantity?: number;
};

type ProductsNormalizerProduct = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  sku?: string;
  price: string;
  price_formatted: string;
  stock?: number;
  quantity?: number;
  items?: ProductsNormalizerBundleItem[];
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

    productList.push({
      price_formatted: toIDR(price),
      id,
      active,
      images,
      name,
      sku,
      price,
      stock,
      quantity,
      items,
    });
  }

  return {
    products     : productList,
    productsCount: data_count,
  };
};

export const ordersNormalizer = (data: unknown): OrdersNormalizerReturn => {
  const { data: ordersData, data_count } = data

  return data;
  // return {
  //   orders     : [],
  //   ordersCount: 0,
  // };
};
