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

type ProductsDocMethods = {
  removeVariants: () => Promise<void>;
  removeFromBundles: () => Promise<void>;
  removeFromSales: () => Promise<void>;
};

type VariantsDocMethods = {
  updateProductStatus: (product: ProductDoc) => Promise<void>;
  removeFromBundles: () => Promise<void>;
  removeFromSales: () => Promise<void>;
};

type BundlesDocMethods = {
  removeFromSales: () => Promise<void>;
};

export type SalesDoc = {
  id: string;
  finished: boolean;
  name: string;
  products: SalesDocProduct[];
  products_sold: SalesDocProductSold[];
  orders: string[];
  revenue: number;
  discount?: string;
  discount_type?: 'percentage' | 'fixed';
  created_at: string;
  updated_at: string;
};

export type SalesDocProduct = {
  id: string;
  quantity: number;
};

export type SalesDocProductSold = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
};

export type SalesCollection = RxCollection<SalesDoc>;

export type OrderDocProduct = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total: string;
};

export type OrderDoc = {
  id: string;
  sales_id: string;
  name: string;
  products: OrderDocProduct[];
  discount?: string;
  discount_type?: 'percentage' | 'fixed';
  total: string;
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
  variants: string[];
  // OLD
  // price: number;
  price: string;
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
  // OLD
  // price: number;
  price: string;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
};

export type VariantCollection = RxCollection<VariantDoc>;

export type BundleDocProduct = {
  id: string;
  product_id: string;
  active: boolean;
  quantity: number;
};

export type BundleDoc = {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  products: BundleDocProduct[];
  // OLD
  // price: number;
  price: string;
  auto_price?: boolean;
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
