/**
 * Product detail normalizers
 *
 * @param data constructed object of product and variant from Rx Query result from product and variant collection.
 * @returns formatted object for product detail page.
 */
export const detailNormalizer = (data: any) => {
  const { product, variant } = data || {};
  let productVariant: any = [];

  variant?.forEach((v: any) => {
    productVariant.push({
      id: v.id || '',
      name: v.name || '',
      image: v.image || [],
      price: v.price || 0,
      stock: v.stock || 0,
    })
  });

  return {
    id: product.id || '',
    name: product.name || '',
    description: product.description || '',
    image: product.image || [],
    by: product.by || '',
    price: product.price || 0,
    stock: product.stock || 0,
    sku: product.sku || '',
    variant: productVariant,
  }
};
