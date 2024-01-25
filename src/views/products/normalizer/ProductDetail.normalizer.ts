/**
 * Product detail normalizers
 *
 * @param data constructed object of product and variant from Rx Query result from product and variant collection.
 * @returns formatted object for product detail page.
 */
export const detailNormalizer = (data: any) => {
  const { product, variant }           = data || {};
  const product_attachments: string[]  = [];
  const product_variants: any          = [];

  if (variant.length) {
    variant.forEach((v: any) => {
      const variant_attachments: string [] = [];

      if (v.attachment.length) {
        v.attachment.map((att: any) => variant_attachments.push(URL.createObjectURL(att.data)));
      }

      product_variants.push({
        id        : v.id || '',
        active    : v.active || false,
        product_id: v.product_id || '',
        name      : v.name || '',
        image     : variant_attachments || [],
        price     : v.price || 0,
        stock     : v.stock || 0,
      });
    });
  }

  if (product.attachment.length) {
    // product.attachment.map((att: any) => product_attachments.push(URL.createObjectURL(att.data)));
    product.attachment.map((att: any) => product_attachments.push(att.data));
  }

  return {
    id         : product.id || '',
    active     : product.active || false,
    name       : product.name || '',
    description: product.description || '',
    image      : product_attachments || [],
    by         : product.by || '',
    price      : product.price || 0,
    stock      : product.stock || 0,
    sku        : product.sku || '',
    variant    : product_variants,
  };
};
