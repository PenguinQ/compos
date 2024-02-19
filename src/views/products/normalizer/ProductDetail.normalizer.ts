type Variant = {
  id: string;
  active: boolean;
  product_id: string;
  name: string;
  image: string[];
  price: number;
  stock: number;
}

type DetailNormalizerReturns = {
  id: string;
  active: boolean;
  name: string;
  description: string;
  image: string[];
  by: string;
  price: number;
  stock: number;
  sku: string;
  variant: Variant[];
};

export const detailNormalizer = (data: any): DetailNormalizerReturns => {
  const { product, variant }        = data || {};
  const product_images: string[]    = [];
  const product_variants: Variant[] = [];

  if (variant?.length) {
    variant.forEach((v: any) => {
      const variant_images: string[] = [];

      v.image.map((att: any) => variant_images.push(att.data));

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

  product?.image.map((att: any) => product_images.push(att.data));

  return {
    id         : product?.id || '',
    active     : product?.active || false,
    name       : product?.name || '',
    description: product?.description || '',
    image      : product_images || [],
    by         : product?.by || '',
    price      : product?.price || 0,
    stock      : product?.stock || 0,
    sku        : product?.sku || '',
    variant    : product_variants,
  };
};
