import type { NormalizerData, NormalizerDataPage } from '@/database/types';
import type { BundlesData } from '@/database/query/bundle/getBundleList';

type BundleList = {
  count: number;
  id: string,
  image: string[];
  name: string;
}

export type BundleListNormalizerReturn = {
  bundles: BundleList[];
  bundles_count: number;
  bundles_count_total: number;
  page: NormalizerDataPage;
};

export const bundleListNormalizer = (data: NormalizerData) => {
  const { data: bundles_data, data_count, page } = data;
  const bundles = bundles_data || [];
  const bundle_list: BundleList[] = [];

  for (const bundle of bundles as BundlesData[]) {
    const { id, name, image, product } = bundle;

    bundle_list.push({
      id,
      name,
      image: image || [],
      count: product.length,
    });
  }

  return {
    page,
    bundles: bundle_list,
    bundles_count: bundle_list.length,
    bundles_count_total: data_count,
  };
};
