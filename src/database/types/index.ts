import type { RxDatabase, RxDocument, RxCollection } from 'rxdb';

export type QueryPage = {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
};

export type QueryParams = {
  active?: boolean;
  limit?: number;
  observe?: boolean;
  page?: number;
  search_query?: string;
  sort?: 'asc' | 'desc';
  normalizer?: (data: unknown) => void;
};

export type QueryReturn = {
  observeable?: boolean;
  result?: unknown;
  normalizer?: (data: unknown) => void;
  observeableProcessor?: (data: RxDocument<unknown>[]) => Promise<object>;
};

export type SalesProductsSold = {
  id: string;
  name: string;
  quantity: number;
};

export type SalesDoc = {
  id: string;
  name: string;
  products: string[];
  products_sold: SalesProductsSold[];
  orders: string[];
  revenue: number;
  finished: boolean;
  created_at: string;
  updated_at: string;
};

export type SalesCollection = RxCollection<SalesDoc>;

export type OrderProduct = {
  id: string;
  name: string;
  subtotal: number;
  quantity: number;
};

export type OrderDoc = {
  id: string;
  sales_id: string;
  name: string;
  products: OrderProduct[];
  subtotal: number;
  created_at: string;
  updated_at: string;
};

export type OrderCollection = RxCollection<OrderDoc>;

export type ProductDoc = {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  by?: string;
  variants?: string[];
  price: number;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
};

export type ProductCollection = RxCollection<ProductDoc>;

export type VariantDoc = {
  id: string;
  product_id: string;
  active: boolean;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
};

export type VariantCollection = RxCollection<VariantDoc>;

export type BundleProduct = {
  id: string;
  active: boolean;
  quantity: number;
};

export type BundleDoc = {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  products: BundleProduct[];
  price?: number;
  created_at: string;
  updated_at: string;
};

export type BundleCollection = RxCollection<BundleDoc>;

export type DatabaseCollection = {
  sales: SalesCollection;
  order: OrderCollection;
  product: ProductCollection;
  variant: VariantCollection;
  bundle: BundleCollection;
};

export type Database = RxDatabase<DatabaseCollection>;
