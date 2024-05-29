import type { ProductsData, VariantsData } from '@/database/query/product/getProductList';
import type { ProductData } from '@/database/query/sales/getSalesDetail';

type FormProduct = {
  id: string;
  name: string;
  image: string;
};

type FormNormalizerData = {
  name: string;
  products: ProductData[];
};

export type FormNormalizerReturn = {
  name: string;
  products: FormProduct[];
};

export type ListVariant = {
  id: string;
  image: string;
  name: string;
};

export type ListProduct = {
  id: string;
  image: string;
  name: string;
  variant: ListVariant[];
};

type ListNormalizerDataPage = {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
};

type ListNormalizerData = {
  data: unknown;
  data_count: number;
  page: ListNormalizerDataPage;
};

export type ListNormalizerReturn = {
  products: ListProduct[];
  page: ListNormalizerDataPage,
};

export const salesFormListNormalizer = (data: unknown): ListNormalizerReturn => {
  const { data: products_data, page, } = data as ListNormalizerData;
  const products = products_data || [];
  const product_list = [];

  for (const product of products as ProductsData[]) {
    const { id, variant: variants, name, images } = product;
    const variant_list = [];

    console.log('Product images:', images);

    for (const variant of variants as VariantsData[]) {
      const { id, images, name } = variant;

      console.log('Variant images:', images);

      variant_list.push({
        id: id || '',
        image: images[0] || '',
        name: name || '',
      });
    };

    product_list.push({
      id: id || '',
      image: images[0] || '',
      name: name || '',
      variant: variant_list,
    });
  }

  return { page, products: product_list };
};

export const salesFormNormalizer = (data: unknown): FormNormalizerReturn => {
  const { name, products } = data as FormNormalizerData;
  const products_list: FormProduct[] = [];

  products.forEach(product => {
    const { id, images, name } = product;
    const product_image = images.length ? images[0] : '';

    products_list.push({ id, name, image: product_image })
  });

  return {
    name,
    products: products_list,
  };
};
