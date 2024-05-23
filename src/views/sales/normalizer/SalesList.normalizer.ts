import type { SalesDoc } from '@/database/types';

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

type SalesList = {
  id: string;
  name: string;
  product_count: number;
};

export type SalesListNormalizerReturn = {
  sales: SalesList[];
  sales_count: number;
  sales_count_tottal: number;
  page: NormalizerDataPage;
};

export const salesListNormalizer = (data: unknown) => {
  const { data: sales_data, data_count, page } =  data as NormalizerData;
  const sales = sales_data || [];
  const sales_list: SalesList[] = [];

  for (const sale of sales as SalesDoc[]) {
    const { id, name, products } = sale;

    sales_list.push({
      id,
      name,
      product_count: products.length,
    });
  }

  return {
    page,
    sales: sales_list,
    sales_count: sales_list.length,
    sales_count_total: data_count,
  };
};
