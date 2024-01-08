import { RxDatabase, RxCollection, RxJsonSchema, RxDocument } from 'rxdb';

export type ProductDoc = {
  id: string,
  active: boolean,
  name: string,
  description?: string,
  image?: string[],
  by?: string,
  price?: number,
  stock?: number,
  variant?: string[],
  sku?: string,
  created_at: string,
  updated_at: string,
}

export type ProductCollection = RxCollection<ProductDoc>;

export type VariantDoc = {
  id: string,
  product_id: string,
  active: boolean,
  name: string,
  image?: string[],
  price: number,
  stock: number,
  sku?: string,
  created_at: string,
  updated_at: string,
}

export type VariantCollection = RxCollection<VariantDoc>;

export type BundleProduct = {
  id: string;
  variant_id?: string;
  active: boolean,
}

export type BundleDoc = {
  id: string,
  active: boolean,
  name: string,
  description?: string,
  product: BundleProduct[];
  price?: number,
  created_at: string;
  updated_at: string;
}

export type BundleCollection = RxCollection<BundleDoc>;

export type DatabaseCollection = {
  product: ProductCollection;
  variant: VariantCollection;
  bundle: BundleCollection;
}

export type Database = RxDatabase<DatabaseCollection>;
