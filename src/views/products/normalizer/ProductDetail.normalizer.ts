// Helpers
import { getUpdateTime, toIDR } from '@/helpers';

// Databases
import type { ProductDetailQueryReturn } from '@/database/query/product/getProductDetail';

type ProductVariants = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  images: string[];
  price: string;
  price_formatted: string;
  stock: number;
  sku?: string;
};

export type ProductDetailNormalizerReturn = {
  id: string;
  active: boolean;
  images: string[];
  name: string;
  description: string;
  by: string;
  price: string;
  priceFormatted: string;
  stock: number;
  sku: string;
  variants: ProductVariants[];
  updatedAt: string;
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
  const productImages   = [];
  const productVariants = [];

  for (const image of images) {
    productImages.push(image.url);
  }

  if (variants) {
    for (const variant of variants) {
      const {
        id,
        product_id,
        active,
        name,
        images,
        price,
        stock,
        sku,
      } = variant;
      const variantImages = [];

      for (const image of images) {
        variantImages.push(image.url);
      }

      productVariants.push({
        id             : id || '',
        active         : active || false,
        product_id     : product_id || '',
        name           : name || '',
        images         : variantImages,
        price          : price ?? '0',
        price_formatted: toIDR(price ?? '0'),
        stock          : stock || 0,
        sku            : sku || '',
      });
    }
  }

  return {
    id             : id || '',
    active         : active || false,
    images         : productImages,
    name           : name || '',
    description    : description || '',
    by             : by || '',
    price          : price ?? '0',
    priceFormatted : toIDR(price ?? '0'),
    stock          : stock || 0,
    sku            : sku || '',
    variants       : productVariants,
    updatedAt      : getUpdateTime(updated_at),
  };
};
