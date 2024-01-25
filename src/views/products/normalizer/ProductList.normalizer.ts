import type { RxDocument } from 'rxdb'

type Data = {
  first_page: boolean;
  last_page: boolean;
  products: RxDocument[];
}

export const productListNormalizer = (data: Data) => {
  const { first_page, last_page, products: products_data } = data;
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
    products: product_list,
  };
};
