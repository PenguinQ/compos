import type { QueryPage } from '@/database/types';
import type { ProductListQueryReturn, VariantsData } from '@/database/query/product/getProductList';
import type { GetBundleDetailQueryReturn } from '@/database/query/bundle/getBundleDetail';

// Common Helpers
import { toIDR } from '@/helpers';

export type DetailProduct = {
  id: string;
  product_id: string;
  active: boolean;
  image: string;
  name: string;
  price: number;
  total_price: string;
  quantity: number;
  sku: string;
};

export type BundleFormDetailNormalizerReturn = {
  id: string;
  name: string;
  description: string;
  price: number;
  auto_price: boolean;
  products: DetailProduct[];
};

export type ListVariant = {
  id: string;
  product_id: string;
  active: boolean;
  image: string;
  name: string;
  price: number;
  total_price: string;
  sku: string;
};

export type ListProduct = {
  id: string;
  active: boolean;
  image: string;
  name: string;
  price: number;
  total_price: string;
  sku: string;
  variants: ListVariant[];
};

export type BundleFormListNormalizerReturn = {
  products: ListProduct[];
  page: QueryPage;
};

export const bundleFormDetailNormalizer = (data: unknown): BundleFormDetailNormalizerReturn => {
  const { id, name, description, price, auto_price, products } = data as GetBundleDetailQueryReturn;
  const products_list: DetailProduct[] = [];

  for (const product of products) {
    const { id, product_id, active, images, name, product_name, price, quantity, sku } = product;
    const product_price = price || 0;
    const product_quantity = quantity || 0;

    products_list.push({
      id: id || '',
      product_id: product_id || '',
      active: active,
      image: images[0] ? images[0].url : '',
      name: product_name ? `${product_name} - ${name}` : name,
      price: product_price,
      total_price: toIDR(product_price * product_quantity),
      quantity: product_quantity,
      sku: sku || '',
    });
  }

  return {
    id: id || '',
    name: name || '',
    description: description || '',
    price: price || 0,
    auto_price: auto_price ? auto_price : false,
    products: products_list,
  };
};

export const bundleFormListNormalizer = (data: unknown): BundleFormListNormalizerReturn => {
  const { data: products_data, page } = data as ProductListQueryReturn;
  const products = products_data || [];
  const product_list = [];

  for (const product of products) {
    const { id: product_id, active, variants, name, images, sku, price } = product;
    const product_price = price || 0;
    const variant_list = [];

    for (const variant of variants as VariantsData[]) {
      const { id: variant_id, active, images, name, price, sku } = variant;
      const variant_price = price || 0;

      variant_list.push({
        id: variant_id || '',
        product_id: product_id || '',
        active: active || false,
        image: images[0] || '',
        name: name || '',
        price: variant_price,
        total_price: toIDR(variant_price * 1),
        sku: sku || '',
      });
    }

    product_list.push({
      id: product_id || '',
      active: active || false,
      image: images[0] || '',
      name: name || '',
      price: product_price,
      total_price: toIDR(product_price * 1),
      variants: variant_list,
      sku: sku || '',
    });
  }

  return { page, products: product_list };
};
