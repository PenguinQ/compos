import type { ProductDetailQueryReturn } from '@/database/query/product/getProductDetail';

type Image = {
  id: string;
  url: string;
};

type ProductVariants = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  images: Image[];
  price: string;
  stock: number;
  sku: string,
};

export type ProductFormNormalizerReturn = {
  id: string;
  active: boolean;
  images: Image[];
  name: string;
  description: string;
  by: string;
  price: string;
  stock: number;
  sku: string;
  variants: ProductVariants[];
};

export const formDetailNormalizer = (data: unknown): ProductFormNormalizerReturn => {
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
  } = data as ProductDetailQueryReturn || {};
  const productImages   = [];
  const productVariants = [];

  for (const image of images) {
    productImages.push({ id: image.id, url: image.url });
  }

  if (variants) {
    for (const variant of variants) {
      const variantImages = [];
      const {
        id,
        product_id,
        name,
        images,
        price,
        stock,
        sku,
      } = variant;

      for (const image of images) {
        variantImages.push({ id: image.id, url: image.url });
      }

      productVariants.push({
        id        : id || '',
        active    : active || false,
        product_id: product_id || '',
        images    : variantImages,
        name      : name || '',
        price     : price ?? '0',
        stock     : stock ?? 0,
        sku       : sku || '',
      });
    }
  }

  return {
    id         : id || '',
    active     : active || false,
    images     : productImages,
    name       : name || '',
    description: description || '',
    by         : by || '',
    price      : price ?? '0',
    stock      : stock ?? 0,
    sku        : sku || '',
    variants   : productVariants,
  };
};
