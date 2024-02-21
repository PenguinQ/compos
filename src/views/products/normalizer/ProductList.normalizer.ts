import type { RxDocument } from 'rxdb'
import type { ProductDoc } from '@/database/types';

interface Product extends ProductDoc {
  image?: string;
}

type NormalizerParams = {
  first_page: boolean;
  last_page: boolean;
  total_page: number;
  count: number;
  products: RxDocument<Product>[];
};

export const productListNormalizer = (data: NormalizerParams) => {
  const { first_page, last_page, total_page, count, products: products_data } = data;
  const products = products_data || [];
  const product_list: object[] = [];

  for (const product of products) {
    const { id, variant, name, image } = product;

    product_list.push({
      id,
      name,
      variant: variant?.length,
      image: image || '',
    });
  }

  return {
    first_page,
    last_page,
    total_page,
    total_count: count,
    count: product_list.length,
    products: product_list,
  };
};
