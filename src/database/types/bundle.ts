export type GetBundleList = {
  search_query: string;
  page: number;
  sort: string;
  limit: number;
  normalizer: (data: any) => void;
}
