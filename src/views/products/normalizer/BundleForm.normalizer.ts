import Big from 'big.js';

// Databases
import type { QueryReturn as BundleDetailReturn } from '@/database/query/bundle/getBundleDetail';
import type { QueryReturn as ProductListReturn, Variant } from '@/database/query/product/getProductList';

export const bundleFormDetailNormalizer = (data: BundleDetailReturn) => {
  const { id, name, description, price, auto_price, products } = data;
  const productList = [];

  for (const product of products) {
    const { id, product_id, active, images, name, product_name, stock, price, quantity, sku } = product;
    const productPrice      = price ?? '0';
    const productQuantity   = quantity ?? 0;
    const productTotalPrice = Big(productPrice).times(quantity).toString();
    const productImages     = []

    for (const image of images) productImages.push(image.url);

    productList.push({
      id        : id || '',
      productId : product_id || '',
      active    : active,
      images    : productImages,
      name      : product_name ? `${product_name} - ${name}` : name,
      price     : productPrice,
      totalPrice: productTotalPrice,
      quantity  : productQuantity,
      sku       : sku || '',
      stock     : stock || 0,
    });
  }

  return {
    id         : id || '',
    name       : name || '',
    description: description || '',
    price      : price ?? '0',
    autoPrice  : auto_price ? auto_price : false,
    products   : productList,
  };
};

export const bundleFormProductListNormalizer = (data: ProductListReturn) => {
  const { data: productsData, page } = data;
  const products    = productsData || [];
  const productList = [];

  for (const product of products) {
    const { id: product_id, active, variants, name, images, price, stock, sku } = product;
    const productPrice      = price ?? '0';
    const productTotalPrice = Big(productPrice).times(1).toString();
    const variantList       = [];
    const productImages     = [];

    for (const image of images) {
      productImages.push(image);
    }

    for (const variant of variants as Variant[]) {
      const { id: variant_id, active, images, name, price, sku } = variant;
      const variantPrice      = price || '0';
      const variantTotalPrice = Big(variantPrice).times(1).toString();
      const variantImages     = [];

      for (const image of images) {
        variantImages.push(image)
      }

      variantList.push({
        id        : variant_id || '',
        productId : product_id || '',
        active    : active || false,
        images    : variantImages,
        name      : name || '',
        price     : variantPrice,
        totalPrice: variantTotalPrice,
        sku       : sku || '',
        stock     : stock || 0,
      });
    }

    productList.push({
      id        : product_id || '',
      active    : active || false,
      images    : productImages,
      name      : name || '',
      price     : productPrice,
      totalPrice: productTotalPrice,
      variants  : variantList,
      sku       : sku || '',
      stock     : stock || 0,
    });
  }

  return {
    products: productList,
    page,
  };
};
