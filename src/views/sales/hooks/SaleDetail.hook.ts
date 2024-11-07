import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import {
  getSaleDetail,
  mutateDeleteSale,
  mutateFinishSale,
} from '@/database/query/sale';

// Normalizers
import { detailNormalizer } from '../normalizer/SaleDetail.normalizer';
import type { DetailNormalizerReturn } from '../normalizer/SaleDetail.normalizer';

export const useSaleDetail = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const dialogDelete = ref(false);
  const dialogFinish = ref(false);

  const {
    data,
    refetch,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['sale-detail', params.id],
    queryFn: () => getSaleDetail({
      id        : params.id as string,
      normalizer: detailNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting sale detail.', type: 'error' });
      console.error('Error getting sale detail.', error.message);
    },
  });

  const {
    mutate   : mutateDelete,
    isLoading: isMutateDeleteLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteSale(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the sale.', type: 'error', duration: 2000 });
      console.error('Failed to delete the sale.', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `Sale ${response} deleted.`, type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate   : mutateFinish,
    isLoading: isMutateFinishLoading,
  } = useMutation({
    mutateFn: () => mutateFinishSale(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to finish the sale.', type: 'error', duration: 2000 });
      console.error('Failed to delete the sale.', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `Sale ${response} finished.`, type: 'success', duration: 2000 });
      dialogFinish.value = false;
      refetch();
    },
  });

  return {
    saleId: params.id,
    data  : data as Ref<DetailNormalizerReturn>,
    dialogDelete,
    dialogFinish,
    isError,
    isLoading,
    refetch,
    mutateDelete,
    mutateFinish,
    isMutateDeleteLoading,
    isMutateFinishLoading,
  };
};
