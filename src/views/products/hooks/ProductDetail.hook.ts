import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { useQuery, useMutation } from '@/database/hooks';
import { mutateDeleteProduct } from '@/database/query/product';
import getProductDetail from '@/database/query/product/getProductDetail';
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
      id: params.id as string,
      normalizer: detailNormalizer,
    }),
    onError: (error: Error) => {
      console.error('[ERROR] Failed to get the product detail.', error);
    },
    onSuccess: (response: any) => {
      console.log('[SUCCESS] Product detail page', response);
    },
  });

  const {
    mutate: deleteProduct,
    isLoading: deleteProductLoading,
    isError: deletepProductError,
  } = useMutation({
    mutateFn: () => mutateDeleteProduct(params.id as string),
    onError: (error: Error) => {
      console.log('[ERROR] Failed to delete the product', error);
    },
    onSuccess: (response: any) => {
      console.log('[SUCCESS] Deleting the product', response);
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
