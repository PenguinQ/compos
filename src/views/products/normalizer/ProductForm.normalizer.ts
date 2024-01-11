export const formDetailNormalizer = (data: any) => {
  const { product, product_attachments, variant } = data || {};
  const productAttachments: object[] = []
  const productVariant: any          = [];

  variant?.forEach((v: any) => {
    productVariant.push({
      id        : v.id || '',
      active    : v.active || false,
      product_id: v.product_id || '',
      name      : v.name || '',
      image     : v.image || [],
      price     : v.price || 0,
      stock     : v.stock || 0,
    })
  });

  product_attachments.map((attachment: any) => {
    const { id, data } = attachment;

    productAttachments.push({ id, path: URL.createObjectURL(data) });
  });

  return {
    id         : product.id || '',
    active     : product.active || false,
    name       : product.name || '',
    description: product.description || '',
    image      : productAttachments || [],
    by         : product.by || '',
    price      : product.price || 0,
    stock      : product.stock || 0,
    sku        : product.sku || '',
    variant    : productVariant,
  }
};
