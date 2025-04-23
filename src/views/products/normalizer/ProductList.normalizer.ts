import type { QueryReturn } from '@/database/query/product/getProductList';

export const productListNormalizer = (data: QueryReturn) => {
  const { data: productsData, data_count: dataCount, page } = data;
  const products     = productsData || [];
  const productList = [];

  for (const product of products) {
    const { id, variants, name, images } = product;
    const productImage = images[0] || '';

    productList.push({
      variants: variants?.length,
      image   : productImage,
      id,
      name,
    });
  }

  return {
    products          : productList,
    productsCount     : productList.length,
    productsCountTotal: dataCount,
    page,
  };
};
