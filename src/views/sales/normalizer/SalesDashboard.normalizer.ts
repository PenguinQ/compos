import { getUpdateTime, toIDR } from '@/helpers';
import type { SalesDetailQueryReturn, ProductData, OrderData } from '@/database/query/sales/getSalesDetail';

import type { ObservableReturns as ProductsQueryReturns } from '@/database/query/sales/getSalesProducts';
// Data Separation
// Sales Detail
/**
 * ---------------
 * Data Separation
 * ---------------
 *
 * 1. Detail (Non Observable Query)
 * - Sales name
 * - Sales status
 * - List of products id available in the sales
 * - List of orders in the sales
 *
 * 2. Product List (Observable Query)
 * -
 *
 * 3. Order List (Observable Query)
 * -
 */

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
type SalesDashboardDetailProduct = {
  id: string;
  product_id?: string;
  quantity: number;
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

export type SalesDashboardDetailNormalizerReturn = {
  name: string;
  finished: boolean;
  products: SalesDashboardDetailProduct[];
  updated_at: string;
};

export const detailsNormalizer = (data: unknown): SalesDashboardDetailNormalizerReturn=> {
  const {
    finished,
    name,
    products,
    updated_at,
  } = data as SalesDetailQueryReturn || {};
  const sales_products: { id: string, product_id?: string, quantity: number }[] = [];

  products.forEach(product => {
    const { id, product_id, quantity } = product;

    sales_products.push({ id, product_id, quantity });
  });

  return {
    name,
    finished,
    products: sales_products,
    updated_at: getUpdateTime(updated_at),
  };
};

export const productsNormalizer = (data: unknown) => {
  const { data: productsData, data_count  } = data as ProductsQueryReturns;
  const products = [];

  for (const product of productsData) {
    const { active, id, images, name, price, quantity, sku, stock } = product;
    const image = images[0] ? images[0].url : '';

    products.push({
      id,
      active,
      image,
      name,
      sku,
      price,
      stock,
      quantity,
    });
  }

  return {
    products,
    count: data_count,
  };
};

export const ordersNormalizer = (data: unknown) => {
  return data;
};
