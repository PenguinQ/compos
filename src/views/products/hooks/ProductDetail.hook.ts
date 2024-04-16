import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useQuery, useMutation } from '@/database/hooks';
import { mutateDeleteProduct } from '@/database/query/product';
import getProductDetail from '@/database/query/product/getProductDetail';
import { detailNormalizer } from '../normalizer/ProductDetail.normalizer';

export const useProductDetail = () => {
  const route = useRoute();
  const router = useRouter();
  const { params } = route;
  const toast = inject('ToastProvider');
  const dialog_delete = ref(false);

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
    onError: (error: unknown) => {
      console.error('[ERROR] Failed to get the product detail.', error);
      toast.add({ message: 'Failed to get the product detail.', type: 'error', duration: 2000 });
    },
  });

  const {
    mutate: deleteProduct,
    isLoading: deleteProductLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteProduct(params.id as string),
    onError: (error: Error) => {
      console.error('[ERROR] Failed to delete the product', error);
      toast.add({ message: 'Failed to delete the product', type: 'error', duration: 2000 });
    },
    onSuccess: () => {
      toast.add({ message: 'Product deleted', type: 'success', duration: 2000 });
      router.back();
    }
  });

  return {
    productID: params.id,
    data,
    dialog_delete,
    isError,
    isLoading,
    isSuccess,
    deleteProduct,
    deleteProductLoading,
    refetch,
  };
};
