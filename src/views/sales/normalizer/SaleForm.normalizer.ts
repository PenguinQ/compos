import type { SaleFormDetailReturn, SaleFormDetailProduct } from '@/database/query/sale/getSaleFormDetail';
import type { ProductListQueryReturn, VariantsData } from '@/database/query/product/getProductList';
import type { BundleListQueryReturn } from '@/database/query/bundle/getBundleList';

type Pagination = {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
};

export type DetailNormalizerReturn = {
  name: string;
  balance?: string;
  products: SaleFormDetailProduct[];
};

export const detailNormalizer = (data: unknown): DetailNormalizerReturn => {
  const { name, initial_balance, products } = data as SaleFormDetailReturn;
  const productList = [];

  for (const product of products) {
    const { id, images, name, quantity } = product;

    productList.push({
      id      : id || '',
      name    : name || '',
      images  : images || [],
      quantity: quantity || 0,
    });
  }

  return {
    products: productList,
    name,
    ...(initial_balance ? { balance: initial_balance } : {}),
  };
};

export type ProductListVariant = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
};

export type ProductList = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  variants: ProductListVariant[];
};

export type ProductListNormalizerReturn = {
  page: Pagination,
  products: ProductList[];
};

export const productListNormalizer = (data: unknown): ProductListNormalizerReturn => {
  const { data: productsData, page } = data as ProductListQueryReturn;
  const productList = [];

  for (const product of productsData) {
    const { id, active, variants, name, images } = product;
    const variantList = [];

    for (const variant of variants as VariantsData[]) {
      const { active, id, images, name } = variant;

      variantList.push({
        id    : id || '',
        active: active || false,
        images: images || [],
        name  : name || '',
      });
    };

    productList.push({
      id      : id || '',
      active  : active || false,
      images  : images || [],
      name    : name || '',
      variants: variantList,
    });
  }

  return { products: productList, page };
};

export type BundleList = Omit<ProductList, 'variants'>;

export type BundleListNormalizerReturn = {
  bundles: BundleList[];
  page: Pagination;
};

export const bundleListNormalizer = (data: unknown): BundleListNormalizerReturn => {
  const { data: bundlesData, page } = data as BundleListQueryReturn;
  const bundleList = [];

  for (const bundle of bundlesData) {
    const { id, active, name, images } = bundle;

    bundleList.push({
      id    : id || '',
      active: active || false,
      images: images || [],
      name  : name || '',
    })
  }

  return { bundles: bundleList, page };
};
