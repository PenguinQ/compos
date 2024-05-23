import { toIDR } from '@helpers';
import type { ProductsData, VariantsData } from '@/database/query/product/getProductList';
import type { BundlesData } from '@/database/query/bundle/getBundleList';

type NormalizerDataPage = {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
};

type NormalizerData = {
  data: unknown;
  data_count: number;
  page: NormalizerDataPage;
};

type VariantList = {
  id: string;
  product_id: string;
  name: string;
  image: string;
  price: string;
  sku: string;
  stock: number;
};

type ProductList = {
  active: boolean;
  id: string;
  name: string;
  description: string;
  by: string;
  price: string;
  stock: number;
  sku: string;
  variant: VariantList[];
  image: string;
};

type BundleList = {
  count: number;
  id: string,
  image: string[];
  name: string;
}

export type ProductListNormalizerReturn = {
  products: ProductList[];
  products_count: number;
  products_count_total: number;
  page: NormalizerDataPage;
};

export type BundleListNormalizerReturn = {
  bundles: BundleList[];
  bundles_count: number;
  bundles_count_total: number;
  page: NormalizerDataPage;
};

export const productListNormalizer = (data: any) => {
  const { data: products_data, data_count, page } = data as NormalizerData;
  const products = products_data || [];
  const product_list: ProductList[] = [];

  for (const product of products as ProductsData[]) {
    const {
      id,
      name,
      description,
      price,
      sku,
      stock,
      by,
      image,
      active,
      variant: variants,
    } = product;
    const variant_list = [];

    for (const variant of variants as VariantsData[]) {
      const { id, product_id, name, image, price, sku, stock } = variant;

      variant_list.push({
        id: id || '',
        product_id: product_id || '',
        name: name || '',
        image: image || '',
        price: price ? toIDR(price): toIDR(0),
        sku: sku || '',
        stock: stock || 0,
      });
    }

    product_list.push({
      active,
      id: id || '',
      name: name || '',
      description: description || '',
      by: by || '',
      price: price ? toIDR(price) : toIDR(0),
      stock: stock || 0,
      sku: sku || '',
      variant: variant_list,
      image: image || '',
    });
  }

  return {
    page,
    products: product_list,
    products_count: product_list.length,
    products_count_total: data_count,
  };
};

export const bundleListNormalizer = (data: unknown) => {
  const { data: bundles_data, data_count, page } = data as NormalizerData;
  const bundles = bundles_data || [];
  const bundle_list: BundleList[] = [];

  for (const bundle of bundles as BundlesData[]) {
    const { id, name, image, product } = bundle;

    bundle_list.push({
      id,
      name,
      image: image || [],
      count: product.length,
    });
  }

  return {
    page,
    bundles: bundle_list,
    bundles_count: bundle_list.length,
    bundles_count_total: data_count,
  };
};
