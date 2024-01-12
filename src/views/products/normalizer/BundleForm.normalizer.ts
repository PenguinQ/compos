export const bundleFormNormalizer = (data: any) => {
  const bundle_data = data || {};
  let product: any = [];
  let total_product_price = 0;

  if (bundle_data.product.length) {
    bundle_data.product.forEach((p: any) => {
      const product_attachments: string[] = [];

      if (p.attachment.length) {
        const attachment = p.attachment[0];

        product_attachments.push(URL.createObjectURL(attachment.data));
      }

      total_product_price += p.price;

      product.push({
        id: p.id || '',
        active: p.active || false,
        name: p.name || '',
        product_id: p.product_id || undefined,
        product_name: p.product_name || undefined,
        image: product_attachments || [],
        price: p.price || 0,
        stock: p.stock || 0,
      })
    });
  }

  return {
    id: bundle_data.id || '',
    name: bundle_data.name || '',
    description: bundle_data.description || '',
    active: bundle_data.active || false,
    price: bundle_data.price,
    fixed_price: bundle_data.fixed_price || false,
    product,
    total_product_price,
  }
};
