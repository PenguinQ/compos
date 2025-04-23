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

/**
 * ------------------------------------------------------------------------------------------------
 * 1. "price" is optional since product can have "variants", and each variant has it's own "price".
 * 2. "stock" is optional since product can have "variants", and each variant has it's own "stock".
 * 3. "sku" is optional since product can have "variants", and each variant has it's own "sku".
 * ------------------------------------------------------------------------------------------------
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
 * ---------------------------------------------------------------------------------------
 * 1. "product_id" is optional since the bundle product can be a product without variants.
 * ---------------------------------------------------------------------------------------
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
  sku?: string;
};

/**
 * ---------------------------------------------------------------------------------------------------
 * 1. "sku" is optional since the product can be a bundle, and each of bundle item has it's own "sku".
 * 2. "items" is optional since "items" only for bundle.
 * ---------------------------------------------------------------------------------------------------
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
  sale_id: string;
  canceled: boolean;
  name: string;
  products: OrderDocProduct[];
  tendered: string;
  change: string;
  total: string;
  note?: string;
  created_at: string;
  updated_at: string;
};

export type OrderCollection = RxCollection<OrderDoc>;

export type SaleDocProduct = {
  id: string;
  quantity: number;
};

export type SaleDocBundleItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  sku?: string;
};

export type SaleDocProductSold = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  sku?: string;
  items?: SaleDocBundleItem[];
  total: string;
};

export type SaleDoc = {
  id: string;
  finished: boolean;
  name: string;
  order_notes?: string[];
  products: SaleDocProduct[];
  products_sold: SaleDocProductSold[];
  orders: string[];
  initial_balance?: string;
  final_balance?: string;
  revenue: string;
  created_at: string;
  updated_at: string;
};

export type SaleCollection = RxCollection<SaleDoc>;

export type DatabaseCollection = {
  product: ProductCollection;
  variant: VariantCollection;
  bundle: BundleCollection;
  order: OrderCollection;
  sale: SaleCollection;
};

export type Database = RxDatabase<DatabaseCollection>;
