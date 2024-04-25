import type { NormalizerData, NormalizerDataPage } from '@/database/types';
import type { ProductsData } from '@/database/query/product/getProductList';

type ProductList = {
  id: string;
  name: string;
  variant?: number;
  image: string;
};

export type ProductListNormalizerReturn = {
  products: ProductList[];
  products_count: number;
  products_count_total: number;
  page: NormalizerDataPage;
};

export const productListNormalizer = (data: NormalizerData) => {
  const { data: products_data, data_count, page } = data;
  const products = products_data || [];
  const product_list: ProductList[] = [];

  for (const product of products as ProductsData[]) {
    const { id, variant, name, image } = product;

    product_list.push({
      id,
      name,
      variant: variant?.length,
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
