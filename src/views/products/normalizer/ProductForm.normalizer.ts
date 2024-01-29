type Image = {
  id: string;
  path: string;
}

type Variant = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  image: Image[];
  price: number;
  stock: number;
}

type Detail = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: Image[];
  by: string;
  price: number;
  stock: number;
  sku: string;
  variant: Variant[];
}

export const formDetailNormalizer = (data: any): Detail => {
  const { product, variant }        = data || {};
  const product_images: Image[]     = [];
  const product_variants: Variant[] = [];

  if (variant.length) {
    variant.forEach((v: any) => {
      const variant_images: Image[] = [];

      v.image.map((att: any) => variant_images.push({ id: att.id, path: att.data }));

      product_variants.push({
        id        : v.id || '',
        active    : v.active || false,
        product_id: v.product_id || '',
        name      : v.name || '',
        image     : variant_images || [],
        price     : v.price || 0,
        stock     : v.stock || 0,
      });
    });
  }

  product.image.map((att: any) => product_images.push({ id: att.id, path: att.data }));

  return {
    id         : product.id || '',
    active     : product.active || false,
    name       : product.name || '',
    description: product.description || '',
    image      : product_images || [],
    by         : product.by || '',
    price      : product.price || 0,
    stock      : product.stock || 0,
    sku        : product.sku || '',
    variant    : product_variants,
  };
};
