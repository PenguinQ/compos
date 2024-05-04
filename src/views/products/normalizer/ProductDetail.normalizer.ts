import { getUpdateTime, toIDR } from '@helpers';
import type { NormalizerData } from '@/database/query/product/getProductDetail';

type ProductVariant = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  image: string[];
  price: number;
  stock: number;
};

export type DetailNormalizerReturn = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: string[];
  by: string;
  price: number;
  stock: number;
  sku: string;
  variant: ProductVariant[];
  updated_at: string;
};

export const detailNormalizer = (data: NormalizerData): DetailNormalizerReturn => {
  const { product, variant } = data || {};
  const product_image: string[] = [];
  const product_variant: ProductVariant[] = [];

  product.image.map(att => product_image.push(att.data));

  if (variant.length) {
    variant.forEach((v: any) => {
      const variant_image: string[] = [];

      // Only push the first image from every image of the product.
      if (v.image.length) variant_image.push(v.image[0].data);

      // If the product_image is empty, fill it with any image from the variant.
      if (!product.image.length) variant_image.map(image => product_image.push(image));

      product_variant.push({
        id        : v.id || '',
        active    : v.active || false,
        product_id: v.product_id || '',
        name      : v.name || '',
        image     : variant_image,
        price     : toIDR(v.price),
        stock     : v.stock || 0,
      });
    });
  }

  return {
    id         : product.id || '',
    active     : product.active || false,
    name       : product.name || '',
    description: product.description || '',
    image      : product_image,
    by         : product.by || '',
    price      : toIDR(product.price),
    stock      : product.stock || 0,
    sku        : product.sku || '',
    variant    : product_variant,
    updated_at : getUpdateTime(product.updated_at),
  };
};
