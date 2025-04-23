// Databases
import type { QueryReturn } from '@/database/query/product/getProductDetail';

// Helpers
import { getUpdateTime, toIDR } from '@/helpers';

export const productDetailNormalizer = (data: QueryReturn) => {
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
  } = data || {};
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
        id            : id || '',
        active        : active || false,
        productId     : product_id || '',
        name          : name || '',
        images        : variantImages,
        price         : price ?? '0',
        priceFormatted: toIDR(price ?? '0'),
        stock         : stock || 0,
        sku           : sku || '',
      });
    }
  }

  return {
    id            : id || '',
    active        : active || false,
    images        : productImages,
    name          : name || '',
    description   : description || '',
    by            : by || '',
    price         : price ?? '0',
    priceFormatted: toIDR(price ?? '0'),
    stock         : stock || 0,
    sku           : sku || '',
    variants      : productVariants,
    updatedAt     : getUpdateTime(updated_at),
  };
};
