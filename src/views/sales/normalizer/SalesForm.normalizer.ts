import type { ProductData } from '@/database/query/sales/getSalesDetail';
import type { ProductListQueryReturn, VariantsData } from '@/database/query/product/getProductList';
import type { BundleListQueryReturn } from '@/database/query/bundle/getBundleList';

type Pagination = {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
};

type FormNormalizerData = {
  name: string;
  products: ProductData[];
};

type FormProduct = {
  id: string;
  images: string[];
  name: string;
  quantity: number;
};

export type DetailNormalizerReturn = {
  name: string;
  products: FormProduct[];
};

export type ListProductVariant = {
  id: string;
  images: string[];
  name: string;
};

export type ListProduct = {
  id: string;
  images: string[];
  name: string;
  variants: ListProductVariant[];
};

export type ProductListNormalizerReturn = {
  products: ListProduct[];
  page: Pagination,
};

export type ListBundle = Omit<ListProduct, 'variants' | 'image'> & {
  images: string[];
};

export type BundleListNormalizerReturn = {
  bundles: ListBundle[];
  page: Pagination;
};

export const detailNormalizer = (data: unknown): DetailNormalizerReturn => {
  const { name, products } = data as FormNormalizerData;
  const products_list: FormProduct[] = [];

  products.forEach(product => {
    const { id, images, name, quantity } = product;

    products_list.push({
      id: id || '',
      name: name || '',
      images: images || [],
      quantity: quantity || 0,
    });
  });

  return {
    products: products_list,
    name,
  };
};

export const productListNormalizer = (data: unknown): ProductListNormalizerReturn => {
  const { data: products_data, page } = data as ProductListQueryReturn;
  const products = products_data || [];
  const product_list = [];

  for (const product of products) {
    const { id, variants, name, images } = product;
    const variant_list = [];

    for (const variant of variants as VariantsData[]) {
      const { id, images, name } = variant;

      variant_list.push({
        id    : id || '',
        images: images || [],
        name  : name || '',
      });
    };

    product_list.push({
      id      : id || '',
      images  : images || [],
      name    : name || '',
      variants: variant_list,
    });
  }

  return { page, products: product_list };
};

export const bundleListNormalizer = (data: unknown) => {
  const { data: bundles_data, page } = data as BundleListQueryReturn;
  const bundles     = bundles_data || [];
  const bundle_list = [];

  for (const bundle of bundles) {
    const { id, name, images } = bundle;

    bundle_list.push({
      id   : id || '',
      image: images || [],
      name : name || '',
    })
  }

  return { page, bundles: bundle_list };
};
