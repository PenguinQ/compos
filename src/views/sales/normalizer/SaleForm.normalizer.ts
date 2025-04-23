import type { QueryReturn as  SaleFormDetailReturn } from '@/database/query/sale/getSaleFormDetail';
import type { QueryReturn as ProductListReturn, Variant } from '@/database/query/product/getProductList';
import type { QueryReturn as BundleListReturn } from '@/database/query/bundle/getBundleList';

export const saleFormDetailNormalizer = (data: SaleFormDetailReturn) => {
  const { name, initial_balance, order_notes, products } = data;
  const productList = [];

  for (const product of products) {
    const { id, images, name, quantity } = product;

    productList.push({
      id      : id || '',
      name    : name || '',
      images  : images || [],
      quantity: quantity || 0,
    });
  }

  return {
    products  : productList,
    orderNotes: order_notes || [],
    name,
    ...(initial_balance ? { balance: initial_balance } : {}),
  };
};

export const saleFormProductListNormalizer = (data: ProductListReturn) => {
  const { data: productsData, page } = data;
  const productList = [];

  for (const product of productsData) {
    const { id, active, variants, name, images } = product;
    const variantList = [];

    for (const variant of variants as Variant[]) {
      const { active, id, images, name } = variant;

      variantList.push({
        id    : id || '',
        active: active || false,
        images: images || [],
        name  : name || '',
      });
    };

    productList.push({
      id      : id || '',
      active  : active || false,
      images  : images || [],
      name    : name || '',
      variants: variantList,
    });
  }

  return { products: productList, page };
};

export const saleFormBundleListNormalizer = (data: BundleListReturn) => {
  const { data: bundlesData, page } = data;
  const bundleList = [];

  for (const bundle of bundlesData) {
    const { id, active, name, images } = bundle;

    bundleList.push({
      id    : id || '',
      active: active || false,
      images: images || [],
      name  : name || '',
    })
  }

  return { bundles: bundleList, page };
};
