import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { mutateDeleteProduct } from '@/database/query/product';
import getProductDetail from '@/database/query/product/getProductDetail';

// Normalizers
import { detailNormalizer } from '../normalizer/ProductDetail.normalizer';
import type { ProductDetailNormalizerReturn } from '../normalizer/ProductDetail.normalizer';

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
    queryKey: ['product-details', params.id],
    queryFn: () => getProductDetail({
      id: params.id as string,
      normalizer: detailNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the product detail,', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the product detail,', error);
    },
  });

  const {
    mutate: deleteProduct,
    isLoading: deleteProductLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteProduct(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the product,', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to delete the product,', error);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Product deleted.', type: 'success', duration: 2000 });
      router.back();
    }
  });

  return {
    product_id: params.id,
    data: data as Ref<ProductDetailNormalizerReturn>,
    dialog_delete,
    isError,
    isLoading,
    isSuccess,
    deleteProduct,
    deleteProductLoading,
    refetch,
  };
};
