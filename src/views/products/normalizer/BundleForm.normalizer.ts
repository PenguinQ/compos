import type { QueryPage } from '@/database/types';
import type { ProductListQueryReturn, VariantsData } from '@/database/query/product/getProductList';
import type { GetBundleDetailQueryReturn } from '@/database/query/bundle/getBundleDetail';

export type DetailProduct = {
  id: string;
  image: string;
  name: string;
  price: number;
  total_price: number;
  quantity: number;
  sku: string;
};

export type BundleFormDetailNormalizerReturn = {
  id: string;
  name: string;
  description: string;
  price: number;
  products: DetailProduct[];
};

export type ListVariant = {
  id: string;
  image: string;
  name: string;
  price: number;
  total_price: number;
  sku: string;
};

export type ListProduct = {
  id: string;
  image: string;
  name: string;
  price: number;
  total_price: number;
  sku: string;
  variants: ListVariant[];
};

export type BundleFormListNormalizerReturn = {
  products: ListProduct[];
  page: QueryPage;
};

export const bundleFormDetailNormalizer = (data: unknown): BundleFormDetailNormalizerReturn => {
  const { id, name, description, price, products } = data as GetBundleDetailQueryReturn;
  const products_list: DetailProduct[] = [];

  for (const product of products) {
    const { id, images, name, product_name, price, quantity, sku } = product;
    const product_image = images[0] ? images[0].url : '';

    products_list.push({
      id: id || '',
      image: product_image,
      name: product_name ? `${product_name} - ${name}` : name,
      price: price || 0,
      total_price: price || 0,
      quantity: quantity || 0,
      sku: sku || '',
    });
  }

  return {
    id: id || '',
    name: name || '',
    description: description || '',
    price: price || 0,
    products: products_list,
  };
};

export const bundleFormListNormalizer = (data: unknown): BundleFormListNormalizerReturn => {
  const { data: products_data, page } = data as ProductListQueryReturn;
  const products = products_data || [];
  const product_list = [];

  for (const product of products) {
    const { id, variants, name, images, sku, price } = product;
    const variant_list = [];

    for (const variant of variants as VariantsData[]) {
      const { id, images, name, price, sku } = variant;

      variant_list.push({
        id: id || '',
        image: images[0] || '',
        name: name || '',
        price: price || 0,
        total_price: price || 0,
        sku: sku || '',
      });
    }

    product_list.push({
      id: id || '',
      image: images[0] || '',
      name: name || '',
      price: price || 0,
      total_price: price || 0,
      variants: variant_list,
      sku: sku || '',
    });
  }

  return { page, products: product_list };
};
