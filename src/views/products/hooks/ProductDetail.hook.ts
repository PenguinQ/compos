import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useQuery, useMutation } from '@/database/hooks';
import { getProductDetail, mutateDeleteProduct } from '@/database/query/product';
import { detailNormalizer } from '../normalizer/ProductDetail.normalizer';

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;
  const delete_id = ref('');

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
      console.log('[SUCCESS] Product detail page', result);
    },
  });

  const {
    mutate: deleteProduct,
    isLoading: deleteProductLoading,
    isError: deletepProductError,
  } = useMutation({
    mutateFn: () => mutateDeleteProduct(params.id as string),
    onError: (error: string) => {
      console.log('[ERROR] Failed to delete the product', error);
    },
    onSuccess: (result: any) => {
      console.log('[SUCCESS] Deleting the product', result);
    }
  });

  return {
    productID: params.id,
    data,
    isError,
    isLoading,
    isSuccess,
    refetch,
    deleteProduct,
    deleteProductLoading,
    deletepProductError,
  };
};
