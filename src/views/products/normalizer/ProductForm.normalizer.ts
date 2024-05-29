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
  price: number;
  stock: number;
  sku: string,
};

export type ProductFormNormalizerReturn = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: Image[];
  by: string;
  price: number;
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
  console.log(data);
  const product_image = images[0] ? [{ id: images[0].id, url: images[0].url }] : [];
  const product_variants: ProductVariants[] = [];

  variants.forEach(v => {
    const { id, product_id, name, images, price, stock, sku } = v;
    const variant_image = images[0] ? [{ id: images[0].id, url: images[0].url }] : [];

    product_variants.push({
      id: id || '',
      active: active || false,
      product_id: product_id || '',
      name: name || '',
      image: variant_image,
      price: price || 0,
      stock: stock || 0,
      sku: sku || '',
    });
  });

  return {
    id: id || '',
    active: active || false,
    name: name || '',
    description: description || '',
    image: product_image,
    by: by || '',
    price: price || 0,
    stock: stock || 0,
    sku: sku || '',
    variants: product_variants,
  };
};
