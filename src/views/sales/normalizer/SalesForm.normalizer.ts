import type { SalesDetailProduct } from '@/database/query/sales/getSalesDetail';
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
  products: SalesDetailProduct[];
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
  const productsList: FormProduct[] = [];

  products.forEach(product => {
    const { id, images, name, quantity } = product;

    productsList.push({
      id      : id || '',
      name    : name || '',
      images  : images || [],
      quantity: quantity || 0,
    });
  });

  return {
    products: productsList,
    name,
  };
};

export const productListNormalizer = (data: unknown): ProductListNormalizerReturn => {
  const { data: productsData, page } = data as ProductListQueryReturn;
  const products    = productsData || [];
  const productList = [];

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

    productList.push({
      id      : id || '',
      images  : images || [],
      name    : name || '',
      variants: variant_list,
    });
  }

  return { page, products: productList };
};

export const bundleListNormalizer = (data: unknown) => {
  const { data: bundlesData, page } = data as BundleListQueryReturn;
  const bundles     = bundlesData || [];
  const bundleList = [];

  for (const bundle of bundles) {
    const { id, name, images } = bundle;

    bundleList.push({
      id   : id || '',
      image: images || [],
      name : name || '',
    })
  }

  return { page, bundles: bundleList };
};
