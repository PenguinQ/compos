type ProductsList = {
  id: string;
  image: string;
  name: string;
  price: number;
  quantity: number;
};

export type FormNormalizerReturn = {
  id: string;
  name: string;
  description: string;
  price: number;
  products: ProductsList[];
};

export const formDetailNormalizer = (data: unknown): FormNormalizerReturn => {
  const { id, name, description, price, products } = data as any;
  const products_list: ProductsList[] = [];

  products.forEach((product: any) => {
    const { id, images, name, price, quantity  } = product;
    const product_image = images.length ? images[0] : '';

    products_list.push({
      id,
      image: product_image,
      name,
      price,
      quantity
    })
  });

  return {
    id,
    name,
    description,
    price,
    products: products_list,
  };
};

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
