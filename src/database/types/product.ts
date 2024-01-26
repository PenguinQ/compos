export type GetProductDetail = {
  page: number;
  sort: string;
  limit: number;
  normalizer: (data: any) => void;
}

