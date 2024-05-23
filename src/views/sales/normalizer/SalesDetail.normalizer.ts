import { getUpdateTime, toIDR } from '@/helpers';
import type { ProductData, OrderData } from '@/database/query/sales/getSalesDetail';

type SalesProduct = {
  name: string;
  price: string;
  image: string;
};

type NormalizerData = {
  finished: boolean;
  id: string;
  name: string;
  orders: OrderData[];
  products: ProductData[];
  products_sold: any[];
  revenue: number;
  created_at: string;
  updated_at: string;
};

export type SalesDetailNormalizerReturn = {
  name: string;
  finished: boolean;
  products: SalesProduct[];
  products_sold: any[];
  orders: any[];
  revenue: string;
  updated_at: string;
};

export const salesDetailNormalizer = (data: unknown): SalesDetailNormalizerReturn => {
  const { name, finished, products, products_sold, orders, revenue, updated_at } = data as NormalizerData || {};
  const sales_products: SalesProduct[] = [];
  const sales_orders: any[] = [];
  const sales_sold: any[] = [];

  products.forEach(product => {
    const { name, price, images } = product;
    const product_image = images.length ? images[0] : '';

    sales_products.push({ name, price: toIDR(price), image: product_image });
  });

  // UNFINISHED - Create List of Order
  // UNFINISHED - Create List of Products Sold

  return {
    name,
    finished,
    products: sales_products,
    products_sold: sales_sold,
    orders: sales_orders,
    revenue: toIDR(revenue),
    updated_at: getUpdateTime(updated_at),
  };
};
