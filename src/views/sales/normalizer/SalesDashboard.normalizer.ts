import type { SalesDoc } from '@/database/types';

export type ListNormalizer = {
  first_page: boolean;
  last_page: boolean;
  total_page: number;
  count: number;
  sales: SalesDoc[] | object[];
};

export const salesListNormalizer = (data: ListNormalizer) => {
  const {
    first_page,
    last_page,
    total_page,
    count,
    sales: sales_data,
  } = data;
  const sales = (sales_data || []) as SalesDoc[];
  const sales_list: object[] = [];

  for (const sale of sales) {
    const { id, name, finished } = sale;

    sales_list.push({ id, name, finished });
  }

  return {
    first_page,
    last_page,
    total_page,
    total_count: count,
    count: sales_list.length,
    sales: sales_list,
  };
};
