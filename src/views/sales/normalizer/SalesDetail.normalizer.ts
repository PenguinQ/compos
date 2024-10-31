import { getUpdateTime, toIDR } from '@/helpers';
import type { SalesDetailQueryReturn } from '@/database/query/sales/getSalesDetail';

type DetailProduct = {
  images: string[];
  name: string;
  price: string;
  priceFormatted: string;
  quantity: number;
};

type DetailProductSold = {
  // TBW
};

type DetailOrderProduct = {
  id: string;
  name: string;
  price: string
  priceFormatted: string;
  quantity: number;
  total: string;
  totalFormatted: string;
};

type DetailOrder = {
  name: string;
  products: DetailOrderProduct[];
  total: string;
  totalFormatted: string;
  tendered: string;
  tenderedFormatted: string;
  change: string;
  changeFormatted: string;
};

export type DetailNormalizerReturn = {
  name: string;
  finished: boolean;
  products: DetailProduct[];
  productsSold: DetailProductSold[];
  orders: DetailOrder[];
  initialBalance?: string;
  initialBalanceFormatted?: string;
  finalBalance?: string;
  finalBalanceFormatted?: string;
  revenue: string;
  revenueFormatted: string;
  updatedAt: string;
};

export const detailNormalizer = (data: unknown): DetailNormalizerReturn => {
  const {
    finished,
    name,
    products,
    products_sold,
    orders,
    initial_balance,
    final_balance,
    revenue,
    updated_at,
  } = data as SalesDetailQueryReturn || {};
  // const salesProducts     = <DetailProduct[]>[];
  // const salesOrders       = <DetailOrder[]>[];
  // const salesProductsSold = <DetailProductSold[]>[];
  const salesProducts     = [];
  const salesOrders       = [];
  const salesProductsSold = [];

  for (const product of products) {
    const { name, price, images, quantity } = product;

    salesProducts.push({
      priceFormatted: toIDR(price),
      images,
      name,
      price,
      quantity,
    });
  }

  for (const order of orders) {
    const { name, products, tendered, change, total }  = order;
    const orderProducts = <DetailOrderProduct[]>[];

    for (const product of products) {
      const { id, name, price, quantity, total } = product;

      orderProducts.push({
        priceFormatted: toIDR(price),
        totalFormatted: toIDR(total),
        id,
        name,
        price,
        quantity,
        total,
      });
    }

    salesOrders.push({
      products         : orderProducts,
      tenderedFormatted: toIDR(tendered),
      changeFormatted  : toIDR(change),
      totalFormatted   : toIDR(total),
      name,
      tendered,
      change,
      total,
    });
  }

  for (const productSold of products_sold) {
    // TBW
  }

  return {
    products        : salesProducts,
    productsSold    : salesProductsSold,
    orders          : salesOrders,
    revenueFormatted: toIDR(revenue),
    updatedAt       : getUpdateTime(updated_at),
    name,
    finished,
    revenue,
    ...(initial_balance ? { initialBalance: initial_balance } : {}),
    ...(initial_balance ? { initialBalanceFormatted: toIDR(initial_balance) } : {}),
    ...(final_balance ? { finalBalance: final_balance } : {}),
    ...(final_balance ? { finalBalanceFormatted: toIDR(final_balance) } : {}),
  };
};
