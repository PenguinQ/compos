import type { RxDatabase, RxCollection } from 'rxdb';

export type SalesDoc = {
  id: string;
  name: string;
  product: string[];
  order?: string[];
  income?: number;
  finished: boolean;
  created_at: string;
  updated_at: string;
};

export type SalesCollection = RxCollection<SalesDoc>;

export type OrderProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderDoc = {
  id: string;
  sales_id: string;
  product: OrderProduct[];
  price: number;
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
  variant?: string[];
  price?: number;
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
  price: number;
  stock: number;
  sku?: string;
  created_at: string;
  updated_at: string;
};

export type VariantCollection = RxCollection<VariantDoc>;

export type BundleProduct = {
  id: string;
  variant_id?: string;
  active: boolean;
};

export type BundleDoc = {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  product: BundleProduct[];
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
