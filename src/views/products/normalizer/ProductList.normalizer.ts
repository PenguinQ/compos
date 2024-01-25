import type { RxDocument } from 'rxdb'

type Data = {
  first_page: boolean;
  last_page: boolean;
  total_page: number;
  count: number;
  products: RxDocument[];
}

export const productListNormalizer = (data: Data) => {
  const { first_page, last_page, total_page, count, products: products_data } = data;
  const products = products_data || [];
  const product_list: object[] = [];

  for (const product of products) {
    const { id, variant, name, attachment } = product as any;

    product_list.push({
      id,
      name,
      variant: variant.length,
      image: attachment || '',
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
