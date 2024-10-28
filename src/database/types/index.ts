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
  updateBundleStatus: (id: string) => Promise<void>;
  removeVariants: () => Promise<void>;
  removeFromBundles: () => Promise<void>;
  removeFromSales: () => Promise<void>;
};

type VariantsDocMethods = {
  updateProductStatus: (product: ProductDoc) => Promise<void>;
  updateBundleStatus: (id: string) => Promise<void>;
  removeFromBundles: () => Promise<void>;
  removeFromSales: () => Promise<void>;
};

type BundlesDocMethods = {
  removeFromSales: () => Promise<void>;
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

export type SalesDoc = {
  id: string;
  finished: boolean;
  name: string;
  products: SalesDocProduct[];
  products_sold: SalesDocProductSold[];
  orders: string[];
  revenue: string;
  discount?: string;
  discount_type?: 'percentage' | 'fixed';
  created_at: string;
  updated_at: string;
};

export type SalesCollection = RxCollection<SalesDoc>;

export type OrderDocBundleItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  sku: string;
};

export type OrderDocProduct = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total: string;
  // Optional since the product can be a bundle, and bundle items has it's own sku.
  sku?: string;
  // Optional since items only for bundle.
  items?: OrderDocBundleItem[];
};

export type OrderDoc = {
  id: string;
  sales_id: string;
  canceled: boolean;
  name: string;
  products: OrderDocProduct[];
  discount?: string;
  discount_type?: 'percentage' | 'fixed';
  tendered: string;
  change: string;
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
