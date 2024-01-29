import type { RxDocument } from 'rxdb'

type Data = {
  first_page: boolean;
  last_page: boolean;
  total_page: number;
  count: number;
  bundles: RxDocument[];
}

export const bundleListNormalizer = (data: Data) => {
  const { first_page, last_page, total_page, count, bundles: bundles_data } = data;
  const bundles = bundles_data || [];
  const bundle_list: object[] = [];

  for (const bundle of bundles) {
    const { id, name, image, product } = bundle as any;

    bundle_list.push({
      id,
      name,
      image: image || [],
      count: product.length,
    });
  }

  return {
    first_page,
    last_page,
    total_page,
    total_count: count,
    count: bundle_list.length,
    bundles: bundle_list,
  };
};
