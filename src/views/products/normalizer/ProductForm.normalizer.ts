import type { QueryReturn } from '@/database/query/product/getProductDetail';

export const productFormDetailNormalizer = (data: QueryReturn) => {
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
  } = data || {};
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
        id       : id || '',
        active   : active || false,
        productId: product_id || '',
        images   : variantImages,
        name     : name || '',
        price    : price ?? '0',
        stock    : stock ?? 0,
        sku      : sku || '',
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
