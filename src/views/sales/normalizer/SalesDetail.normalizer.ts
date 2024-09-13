import { getUpdateTime, toIDR } from '@/helpers';
import type { SalesDetailQueryReturn, ProductData, OrderData } from '@/database/query/sales/getSalesDetail';

/**
 * --------------------------------------
 * I. Yang dibutuhkan untuk daftar produk
 * --------------------------------------
 * 1. gambar produk
 * 2. nama produk
 * 3. kuantitas produk
 * 4. harga produk
 * 5. sku (probably)
 */
type SalesDetailProduct = {
  name: string;
  price: string;
  image: string;
};

/**
 * ----------------------------------------------------
 * II. Yang dibutuhkan untuk daftar produk yang terjual
 * ----------------------------------------------------
 * 1. gambar produk
 * 2. nama produk
 * 3. jumlah produk yang terjual
 * 4. total harga produk yang terjual
 */
type SalesDetailProductSold = {

};

/**
 * ---------------------------------------
 * III. Yang dibutuhkan untuk daftar order
 * ---------------------------------------
 * 1. nama order
 * 2. daftar produk di setiap order (nama, jumlah, harga, total produk)
 * 4. total harga dari semua produk yang ada di order masing-masing
 *
 * Eg:
 * Order #1
 * -------------------------
 * Product 1 x5   @Rp100,000
 * Product 2 x1    @Rp25,000
 * -------------------------
 *          Total: Rp125,000
 */
type SalesDetailOrder = {

};

export type SalesDetailNormalizerReturn = {
  name: string;
  finished: boolean;
  products: SalesDetailProduct[];
  products_sold: SalesDetailProductSold[];
  orders: SalesDetailOrder[];
  revenue: string;
  discount?: number;
  discount_type?: 'percentage' | 'fixed';
  updated_at: string;
};

export const salesDetailNormalizer = (data: unknown): SalesDetailNormalizerReturn => {
  const {
    finished,
    name,
    products,
    products_sold,
    orders,
    revenue,
    discount,
    discount_type,
    updated_at,
  } = data as SalesDetailQueryReturn || {};
  const sales_products: any[] = [];
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
