import { useRoute } from 'vue-router';

import { useQuery } from '@database/hooks';
import { getProductDetail } from '@database/query/product';
import { detailNormalizer } from '../normalizer/ProductDetail.normalizer';

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;

  // Get product detail hooks.
  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => getProductDetail({
      id: params.id,
      normalizer: detailNormalizer,
    }),
    onError: (error: string) => {
      console.error('[ERROR] Failed to get the product detail.', error);
    },
    onSuccess: (result: any) => {
      console.info('[SUCCESS] Product detail page');
    },
  });

  return {
    productID: params.id,
    data,
    isError,
    isLoading,
    isSuccess,
    refetch,
  };
};
