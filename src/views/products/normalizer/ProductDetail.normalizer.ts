/**
 * Product detail normalizers
 *
 * @param data constructed object of product and variant from Rx Query result from product and variant collection.
 * @returns formatted object for product detail page.
 */
export const detailNormalizer = (data: any) => {
  const { product, product_attachments, variant } = data || {};
  const productAttachments: string[] = []
  let productVariant: any = [];

  variant?.forEach((v: any) => {
    productVariant.push({
      id: v.id || '',
      active: v.active || false,
      product_id: v.product_id || '',
      name: v.name || '',
      image: v.image || [],
      price: v.price || 0,
      stock: v.stock || 0,
    })
  });

  product_attachments.map((attachment: any) => {
    productAttachments.push(URL.createObjectURL(attachment));
  });

  return {
    id: product.id || '',
    active: product.active || false,
    name: product.name || '',
    description: product.description || '',
    image: productAttachments || [],
    by: product.by || '',
    price: product.price || 0,
    stock: product.stock || 0,
    sku: product.sku || '',
    variant: productVariant,
  }
};
