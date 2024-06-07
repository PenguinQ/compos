// Helpers
import { getUpdateTime, toIDR } from '@helpers';

// Types
import type { ProductDetailQueryReturn } from '@/database/query/product/getProductDetail';

type ProductVariants = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  sku: string;
};

export type ProductDetailNormalizerReturn = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: string;
  by: string;
  price: number;
  stock: number;
  sku: string;
  variants: ProductVariants[];
  updated_at: string;
};

export const detailNormalizer = (data: unknown): ProductDetailNormalizerReturn => {
  const {
    id,
    active,
    images,
    name,
    description,
    by,
    price,
    stock,
    sku,
    variants,
    updated_at,
  } = data as ProductDetailQueryReturn || {};
  const product_image = images[0] ? images[0].url : '';
  const product_variants: ProductVariants[] = [];

  variants.forEach(variant => {
    const { id, product_id, active, name, images, price, stock, sku } = variant;
    const variant_image = images[0] ? images[0].url : '';

    product_variants.push({
      id: id || '',
      active: active || false,
      product_id: product_id || '',
      name: name || '',
      image: variant_image,
      price: toIDR(price ? price : 0),
      stock: stock || 0,
      sku: sku || '-',
    });
  });

  return {
    id: id || '',
    active: active || false,
    name: name || '',
    description: description || '',
    image: product_image,
    by: by || '',
    price: toIDR(price ? price : 0),
    stock: stock || 0,
    sku: sku || '',
    variants: product_variants,
    updated_at: getUpdateTime(updated_at),
  };
};
