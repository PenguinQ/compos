// Helpers
import { getUpdateTime, toIDR } from '@/helpers';

// Databases
import type { GetBundleDetailQueryReturn } from '@/database/query/bundle/getBundleDetail';

type BundleDetailProduct = {
  id: string;
  active: boolean;
  name: string;
  product_id?: string;
  product_name?: string;
  image: string;
  price: string;
  price_formatted: string;
  stock: number;
  sku: string;
  quantity: number;
};

export type BundleDetailNormalizerReturn = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  images: string[];
  price: string;
  price_formatted: string;
  products: BundleDetailProduct[];
  updated_at: string;
};

export const bundleDetailNormalizer = (data: unknown): BundleDetailNormalizerReturn => {
  const { id, active, name, description, price, products, updated_at } = data as GetBundleDetailQueryReturn;
  let products_list: BundleDetailProduct[] = [];
  let bundle_images: string[]  = [];

  for (const product of products) {
    const { id, active, images, name, product_name, price, stock, sku, quantity } = product;
    const product_image = images[0] ? images[0].url : '';

    if (product_image) bundle_images.push(product_image);

    products_list.push({
      id             : id || '',
      active         : active || false,
      name           : name || '',
      product_name   : product_name || '',
      image          : product_image,
      price          : price ?? '0',
      price_formatted: toIDR(price ?? '0'),
      stock          : stock ?? 0,
      quantity       : quantity ?? 0,
      sku            : sku || '',
    });
  }

  return {
    id             : id || '',
    active         : active || false,
    name           : name || '',
    description    : description || '',
    images         : bundle_images,
    price          : price ?? '0',
    price_formatted: toIDR(price ?? '0'),
    products       : products_list,
    updated_at     : getUpdateTime(updated_at),
  };
};
