import type { ProductsData } from '@/database/query/product/getProductList';

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

type ProductList = {
  id: string;
  name: string;
  variants?: number;
  image: string;
};

export type ProductListNormalizerReturn = {
  products: ProductList[];
  products_count: number;
  products_count_total: number;
  page: NormalizerDataPage;
};

export const productListNormalizer = (data: unknown) => {
  const { data: products_data, data_count, page } = data as NormalizerData;
  const products     = products_data || [];
  const product_list = <ProductList[]>[];

  for (const product of products as ProductsData[]) {
    const { id, variants, name, images } = product;
    const product_image = images[0] || '';

    product_list.push({
      variants: variants?.length,
      image   : product_image,
      id,
      name,
    });
  }

  return {
    products            : product_list,
    products_count      : product_list.length,
    products_count_total: data_count,
    page,
  };
};
