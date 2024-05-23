import type { BundlesData } from '@/database/query/bundle/getBundleList';

type NormalizerDataPage = {
  current: number;
  first: boolean;
  last: boolean;
  total: number;
};

type NormalizerData = {
  data: unknown;
  data_count: number;
  page: NormalizerDataPage;
};

type BundleList = {
  count: number;
  id: string,
  images: string[];
  name: string;
};

export type BundleListNormalizerReturn = {
  bundles: BundleList[];
  bundles_count: number;
  bundles_count_total: number;
  page: NormalizerDataPage;
};

export const bundleListNormalizer = (data: unknown) => {
  const { data: bundles_data, data_count, page } = data as NormalizerData;
  const bundles = bundles_data || [];
  const bundle_list: BundleList[] = [];

  console.log(data);

  for (const bundle of bundles as BundlesData[]) {
    const { id, name, images, product } = bundle;

    bundle_list.push({
      id,
      name,
      images: images || [],
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
