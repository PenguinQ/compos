import type { QueryReturn } from '@/database/query/bundle/getBundleList';

export const bundleListNormalizer = (data: QueryReturn) => {
  const { data: bundlesData, data_count: dataCount, page } = data;
  const bundles      = bundlesData || [];
  const bundlesList = [];

  for (const bundle of bundles) {
    const { id, name, images, products } = bundle;

    bundlesList.push({
      images: images || [],
      count : products.length,
      id,
      name,
    });
  }

  return {
    bundles          : bundlesList,
    bundlesCount     : bundlesList.length,
    bundlesCountTotal: dataCount,
    page,
  };
};
