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
  image: Image[];
  price: string;
  stock: number;
  sku: string,
};

export type ProductFormNormalizerReturn = {
  id: string;
  active: boolean;
  image: Image[];
  name: string;
  description?: string;
  by?: string;
  price?: string;
  stock?: number;
  sku?: string;
  variants?: ProductVariants[];
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
  const product_image    = images[0] ? [{ id: images[0].id, url: images[0].url }] : [];
  const product_variants = <ProductVariants[]>[];

  for (const variant of variants) {
    const {
      id,
      product_id,
      name,
      images,
      price,
      stock,
      sku,
    } = variant;
    const variant_image = images[0] ? [{ id: images[0].id, url: images[0].url }] : [];

    product_variants.push({
      id        : id || '',
      active    : active || false,
      product_id: product_id || '',
      image     : variant_image,
      name      : name || '',
      price     : price ?? '0',
      stock     : stock ?? 0,
      sku       : sku || '',
    });
  }

  console.log(data);

  return {
    id         : id || '',
    active     : active || false,
    image      : product_image,
    name       : name || '',
    description: description || '',
    by         : by || '',
    price      : price ?? '0',
    stock      : stock ?? 0,
    sku        : sku || '',
    ...(variants ? { variants: product_variants }: {}),
    // variants   : product_variants,
  };
};
