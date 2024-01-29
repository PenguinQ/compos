export type GetProductList = {
  search_query: string;
  page: number;
  sort: string;
  limit: number;
  normalizer: (data: any) => void;
}

