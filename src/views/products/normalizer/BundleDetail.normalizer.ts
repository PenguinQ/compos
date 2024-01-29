/**
 * Bundle detail normalizers
 *
 * @param data constructed object of buidle details from Rx Query results.
 * @returns formatted object for bundle detail page.
 */
export const bundleDetailNormalizer = (data: any) => {
  const bundle_data = data || {};
  const { product } = bundle_data;
  let product_list: any = [];
  let total_product_price = 0;

  if (product && product.length) {
    product.map((prd: any) => {
      total_product_price += prd.price;

      product_list.push({
        id: prd.id || '',
        active: prd.active || false,
        name: prd.name || '',
        product_id: prd.product_id || undefined,
        product_name: prd.product_name || undefined,
        image: prd.image[0] || '',
        price: prd.price || 0,
        stock: prd.stock || 0,
      })
    });
  }

  return {
    id: bundle_data.id || '',
    name: bundle_data.name || '',
    description: bundle_data.description || '',
    active: bundle_data.active || false,
    price: bundle_data.price,
    product: product_list,
    total_product_price,
  }
};
