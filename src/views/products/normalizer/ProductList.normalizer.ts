import type { RxDocument } from 'rxdb'

export const productListNormalizer = (data: RxDocument[]) => {
  const products = data || [];
  const productList: object[] = [];

  products.map((product: any) => {
    const { id, variant, name, attachment } = product;
    let product_image = attachment ? URL.createObjectURL(attachment) : '';

    productList.push({
      id,
      name,
      variant: variant.length,
      image: product_image,
    });
  });

  return productList;
};
