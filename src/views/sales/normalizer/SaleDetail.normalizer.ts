import { getUpdateTime, toIDR } from '@/helpers';
import type { SaleDetailQueryReturn } from '@/database/query/sale/getSaleDetail';

type DetailProductBundleItem = {
  name: string;
  quantity: number;
};

type DetailProduct = {
  images: string[];
  name: string;
  price: string;
  priceFormatted: string;
  quantity: number;
  items?: DetailProductBundleItem[];
};

type DetailProductSoldItem = {
  name: string;
  quantity: number;
};

type DetailProductSold = {
  name: string;
  quantity: number;
  total: string;
  totalFormatted: string;
  items?: DetailProductSoldItem[];
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
  } = data as SaleDetailQueryReturn || {};
  const saleProducts     = [];
  const saleOrders       = [];
  const saleProductsSold = [];

  for (const product of products) {
    const { name, price, images, quantity, items } = product;
    const saleProductsItems = [];

    if (items) {
      for (const item of items) {
        const { name, quantity } = item;

        saleProductsItems.push({ name, quantity });
      }
    }

    saleProducts.push({
      priceFormatted: toIDR(price),
      images,
      name,
      price,
      quantity,
      ...(items ? { items: saleProductsItems } : {}),
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

    saleOrders.push({
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

  for (const product of products_sold) {
    const { name, quantity, total, items } = product;
    const product_items = [];

    if (items) {
      for (const item of items) {
        const { name, quantity } = item;

        product_items.push({ name, quantity });
      }
    }

    saleProductsSold.push({
      totalFormatted: toIDR(total),
      name,
      total,
      quantity,
      ...(items ? { items: product_items } : {}),
    });
  }

  return {
    products        : saleProducts,
    productsSold    : saleProductsSold,
    orders          : saleOrders,
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
