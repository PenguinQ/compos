import type { RxDatabase, RxCollection } from 'rxdb';

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
  observeableProcessor?: (data: unknown) => Promise<object>;
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

/**
 * ---------------------------------------------------------------------------------------
 * 1. Price is optional, since product can have variants, each variant has it's own price.
 * 2. Stock is optional since product can have variants, each variant has it's own stock.
 * 3. SKU is optional and since product can have variants, each variant has it's own SKU.
 * ---------------------------------------------------------------------------------------
 */
export type ProductDoc = {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  by?: string;
  variants?: string[];
  price?: string;
  stock?: number;
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

/**
 * ------------------------------------------------------------------------------
 * 1. product_id is optional, since the product can be a product without variant.
 * ------------------------------------------------------------------------------
 */
export type BundleDocProduct = {
  id: string;
  product_id?: string;
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
  auto_price: boolean;
  created_at: string;
  updated_at: string;
};

export type BundleCollection = RxCollection<BundleDoc>;

export type OrderDocBundleItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  sku: string;
};

/**
 * ----------------------------------------------------------------------------------------
 * 1. SKU is optional, since the product can be a bundle and bundle items has it's own sku.
 * 2. Items is optional, since items only for bundle.
 * ----------------------------------------------------------------------------------------
 */
export type OrderDocProduct = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total: string;
  sku?: string;
  items?: OrderDocBundleItem[];
};

export type OrderDoc = {
  id: string;
  sales_id: string;
  canceled: boolean;
  name: string;
  products: OrderDocProduct[];
  tendered: string;
  change: string;
  total: string;
  created_at: string;
  updated_at: string;
  // discount?: string;
  // discount_type?: 'percentage' | 'fixed';
};

export type OrderCollection = RxCollection<OrderDoc>;

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
  initial_balance?: string;
  final_balance?: string;
  revenue: string;
  created_at: string;
  updated_at: string;
  // discount?: string;
  // discount_type?: 'percentage' | 'fixed';
};

export type SalesCollection = RxCollection<SalesDoc>;

export type DatabaseCollection = {
  sales: SalesCollection;
  order: OrderCollection;
  product: ProductCollection;
  variant: VariantCollection;
  bundle: BundleCollection;
};

export type Database = RxDatabase<DatabaseCollection>;
