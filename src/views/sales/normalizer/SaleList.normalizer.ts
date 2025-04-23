import type { QueryReturn } from '@/database/query/sale/getSaleList';

export const saleListNormalizer = (data: QueryReturn) => {
  const { data: saleList, data_count: saleListCount, page } = data;
  const tempList = [];

  for (const sale of saleList) {
    const { id, name, products } = sale;

    tempList.push({
      id,
      name,
      productCount: products.length,
    });
  }

  return {
    page           : page!,
    sales          : tempList,
    salesCount     : tempList.length,
    salesCountTotal: saleListCount,
  };
};
