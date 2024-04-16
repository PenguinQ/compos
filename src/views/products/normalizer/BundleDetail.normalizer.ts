import { getUpdateTime, toIDR } from '@helpers';

type Product = {
  id: string;
  active: boolean;
  name: string;
  product_id?: string;
  product_name?: string;
  image: string[];
  price: number;
  stock: number;
};

type DetailNormalizerReturns = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: string[];
  price: string;
  product: object[];
  total_price: string;
  updated_at: string;
};

export const bundleDetailNormalizer = (data: any): DetailNormalizerReturns => {
  const bundle = data || {};
  const { product } = bundle;
  let product_list: Product[] = [];
  let bundle_image: string[] = [];
  let total_price = 0;

  if (product?.length) {
    product.map((p: any) => {
      const product_image: string[] = [];

      // Only push the first image from every image of the product.
      if (p.image.length) product_image.push(p.image[0].data);

      // Push every product image inside product_image array to bundle_image.
      product_image.map((image: string) => bundle_image.push(image));

      total_price += p.price;

      product_list.push({
        id: p.id || '',
        active: p.active || false,
        name: p.name || '',
        product_id: p.product_id || '',
        product_name: p.product_name || '',
        image: product_image,
        price: p.price ? toIDR(p.price) : 0,
        stock: p.stock || 0,
      })
    });
  }

  return {
    id: bundle.id || '',
    active: bundle.active || false,
    name: bundle.name || '',
    description: bundle.description || '',
    image: bundle_image,
    price: bundle.price ? toIDR(bundle.price) : 0,
    product: product_list,
    total_price: toIDR(total_price),
    updated_at : getUpdateTime(bundle.updated_at),
  };
};
