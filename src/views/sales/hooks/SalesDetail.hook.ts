import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import {
  getSalesDetail,
  mutateDeleteSales,
  mutateFinishSales,
} from '@/database/query/sales';

// Normalizers
import { detailNormalizer } from '../normalizer/SalesDetail.normalizer';
import type { DetailNormalizerReturn } from '../normalizer/SalesDetail.normalizer';

export const useSalesDetail = () => {
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
    queryKey: ['sales-detail', params.id],
    queryFn: () => getSalesDetail({
      id        : params.id as string,
      normalizer: detailNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting sales detail.', type: 'error' });
      console.error('Error getting sales detail.', error.message);
    },
  });

  const {
    mutate   : mutateDelete,
    isLoading: isMutateDeleteLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteSales(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the sales.', type: 'error', duration: 2000 });
      console.error('Failed to delete the sales', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `Sales ${response} deleted.`, type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate   : mutateFinish,
    isLoading: isMutateFinishLoading,
  } = useMutation({
    mutateFn: () => mutateFinishSales(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to finish the sales.', type: 'error', duration: 2000 });
      console.error('Failed to delete the sales.', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `Sales ${response} finished.`, type: 'success', duration: 2000 });
      router.back();
    },
  });

  return {
    salesId: params.id,
    data: data as Ref<DetailNormalizerReturn>,
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
