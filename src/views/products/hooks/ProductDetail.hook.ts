import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { mutateDeleteProduct } from '@/database/query/product';
import getProductDetail from '@/database/query/product/getProductDetail';

// Normalizers
import { productDetailNormalizer } from '../normalizer/ProductDetail.normalizer';

export const useProductDetail = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const dialogDelete = ref(false);

  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ['product-details', params.id],
    queryFn: () => getProductDetail(params.id as string),
    queryNormalizer: productDetailNormalizer,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the product detail', type: 'error', duration: 2000 });
      console.error('Failed to get the product detail,', error.message);
    },
  });

  const {
    mutate   : deleteProduct,
    isLoading: deleteProductLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteProduct(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the product', type: 'error', duration: 2000 });
      console.error('Failed to delete the product,', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Product deleted', type: 'success', duration: 2000 });
      router.push('/product');
    }
  });

  const handleRefresh = async (e: any) => {
    await refetch();
    e.complete();
  };

  return {
    productId: params.id,
    data,
    dialogDelete,
    isError,
    isLoading,
    isSuccess,
    deleteProduct,
    deleteProductLoading,
    refetch,
    handleRefresh,
  };
};
