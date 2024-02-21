import type { RxDocument } from 'rxdb';
import type { BundleDoc } from '@/database/types';

interface Bundle extends BundleDoc {
  image?: string[];
}

type NormalizerParams = {
  first_page: boolean;
  last_page: boolean;
  total_page: number;
  count: number;
  bundles: RxDocument<Bundle>[];
};

export const bundleListNormalizer = (data: NormalizerParams) => {
  const { first_page, last_page, total_page, count, bundles: bundles_data } = data;
  const bundles = bundles_data || [];
  const bundle_list: object[] = [];

  for (const bundle of bundles) {
    const { id, name, image, product } = bundle;

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
