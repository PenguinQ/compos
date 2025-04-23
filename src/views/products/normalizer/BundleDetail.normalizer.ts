// Helpers
import { getUpdateTime, toIDR } from '@/helpers';

// Databases
import type { QueryReturn } from '@/database/query/bundle/getBundleDetail';

export const bundleDetailNormalizer = (data: QueryReturn) => {
  const { id, active, name, description, price, products, updated_at } = data;
  const productList  = [];
  const bundleImages = [];

  for (const product of products) {
    const { id, active, images, name, product_name, price, stock, sku, quantity } = product;
    const productImage = images[0] ? images[0].url : '';

    if (productImage) bundleImages.push(productImage);

    productList.push({
      id            : id || '',
      active        : active || false,
      name          : name || '',
      productName   : product_name || '',
      image         : productImage,
      price         : price ?? '0',
      priceFormatted: toIDR(price ?? '0'),
      stock         : stock ?? 0,
      quantity      : quantity ?? 0,
      sku           : sku || '',
    });
  }

  return {
    id            : id || '',
    active        : active || false,
    name          : name || '',
    description   : description || '',
    images        : bundleImages,
    price         : price ?? '0',
    priceFormatted: toIDR(price ?? '0'),
    products      : productList,
    updatedAt     : getUpdateTime(updated_at),
  };
};
