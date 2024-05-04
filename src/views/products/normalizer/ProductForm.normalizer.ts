import type { NormalizerData } from '@/database/query/product/getProductDetail';

type ProductVariantImage = {
  id: string;
  path: string;
};

type ProductVariant = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  image: ProductVariantImage[];
  price: number;
  stock: number;
}

export type ProductFormNormalizerReturn = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: ProductVariantImage[];
  by: string;
  price: number;
  stock: number;
  sku: string;
  variant: ProductVariant[];
};

export const formDetailNormalizer = (data: NormalizerData): ProductFormNormalizerReturn => {
  const { product, variant } = data || {};
  const product_image: ProductVariantImage[] = [];
  const product_variant: ProductVariant[] = [];

  if (variant.length) {
    variant.forEach(v => {
      const variant_images: ProductVariantImage[] = [];

      v.image.map(img => variant_images.push({ id: img.id, path: img.data }));

      product_variant.push({
        id: v.id || '',
        active: v.active || false,
        product_id: v.product_id || '',
        name: v.name || '',
        image: variant_images || [],
        price: v.price || 0,
        stock: v.stock || 0,
      });
    });
  }

  product.image.map(img => product_image.push({ id: img.id, path: img.data }));

  return {
    id: product.id || '',
    active: product.active || false,
    name: product.name || '',
    description: product.description || '',
    image: product_image || [],
    by: product.by || '',
    price: product.price || 0,
    stock: product.stock || 0,
    sku: product.sku || '',
    variant: product_variant,
  };
};
