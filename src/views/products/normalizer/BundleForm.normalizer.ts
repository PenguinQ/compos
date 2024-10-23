import Big from 'big.js';

// Databases
import type { QueryPage } from '@/database/types';
import type { ProductListQueryReturn, VariantsData } from '@/database/query/product/getProductList';
import type { GetBundleDetailQueryReturn } from '@/database/query/bundle/getBundleDetail';

export type FormDetailProduct = {
  id: string;
  product_id: string;
  active: boolean;
  image: string;
  name: string;
  price: string;
  total_price: string;
  stock: number;
  quantity: number;
  sku: string;
};

export type FormDetailNormalizerReturn = {
  id: string;
  name: string;
  description: string;
  price: string;
  auto_price: boolean;
  products: FormDetailProduct[];
};

export type FormProductListVariant = {
  id: string;
  product_id: string;
  active: boolean;
  image: string;
  name: string;
  price: string;
  total_price: string;
  stock: number;
  sku: string;
};

export type FormProductListProduct = {
  id: string;
  active: boolean;
  image: string;
  name: string;
  price: string;
  total_price: string;
  sku: string;
  stock: number;
  variants: FormProductListVariant[];
};

export type FormProductListNormalizerReturn = {
  products: FormProductListProduct[];
  page: QueryPage;
};

export const formDetailNormalizer = (data: unknown): FormDetailNormalizerReturn => {
  const { id, name, description, price, auto_price, products } = data as GetBundleDetailQueryReturn;
  const products_list = <FormDetailProduct[]>[];

  for (const product of products) {
    const { id, product_id, active, images, name, product_name, stock, price, quantity, sku } = product;
    const product_price       = price ?? '0';
    const product_quantity    = quantity ?? 0;
    const product_total_price = Big(product_price).times(quantity).toString();

    products_list.push({
      id         : id || '',
      product_id : product_id || '',
      active     : active,
      image      : images[0] ? images[0].url : '',
      name       : product_name ? `${product_name} - ${name}` : name,
      price      : product_price,
      total_price: product_total_price,
      quantity   : product_quantity,
      sku        : sku || '',
      stock,
    });
  }

  return {
    id         : id || '',
    name       : name || '',
    description: description || '',
    price      : price ?? '0',
    auto_price : auto_price ? auto_price : false,
    products   : products_list,
  };
};

export const formProductListNormalizer = (data: unknown): FormProductListNormalizerReturn => {
  const { data: products_data, page } = data as ProductListQueryReturn;
  const products     = products_data || [];
  const product_list = <FormProductListProduct[]>[];

  for (const product of products) {
    const { id: product_id, active, variants, name, images, price, stock, sku } = product;
    const product_price       = price ?? '0';
    const product_total_price = Big(product_price).times(1).toString();
    const variant_list        = <FormProductListVariant[]>[];

    for (const variant of variants as VariantsData[]) {
      const { id: variant_id, active, images, name, price, sku } = variant;
      const variant_price       = price || '0';
      const variant_total_price = Big(variant_price).times(1).toString();

      variant_list.push({
        id         : variant_id || '',
        product_id : product_id || '',
        active     : active || false,
        image      : images[0] || '',
        name       : name || '',
        price      : variant_price,
        total_price: variant_total_price,
        sku        : sku || '',
        stock,
      });
    }

    product_list.push({
      id         : product_id || '',
      active     : active || false,
      image      : images[0] || '',
      name       : name || '',
      price      : product_price,
      total_price: product_total_price,
      variants   : variant_list,
      sku        : sku || '',
      stock
    });
  }

  return {
    products: product_list,
    page,
  };
};
