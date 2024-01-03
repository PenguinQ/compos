/**
 * Bundle detail normalizers
 *
 * @param data constructed object of buidle details from Rx Query results.
 * @returns formatted object for bundle detail page.
 */
export const bundleDetailNormalizer = (data: any) => {
  const bundleData = data || {};
  let product: any = [];

  if (bundleData.product.length) {
    bundleData.product.forEach((p: any) => {
      product.push({
        id: p.id || '',
        name: p.name || '',
        product_id: p.product_id || undefined,
        product_name: p.product_name || undefined,
        image: p.image || [],
        price: p.price || 0,
        stock: p.stock || 0,
      })
    });
  }

  return {
    id: bundleData.id || '',
    name: bundleData.name || '',
    description: bundleData.description || '',
    active: bundleData.active || false,
    price: bundleData.price || 0,
    fixed_price: bundleData.fixed_price || false,
    stock: bundleData.stock || 0,
    product,
  }
};
