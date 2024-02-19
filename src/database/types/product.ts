export type GetProductList = {
  type?: 'product' | 'bundle';
  search_query: string;
  page: number;
  sort: string;
  limit: number;
  normalizer: (data: any) => void;
}

