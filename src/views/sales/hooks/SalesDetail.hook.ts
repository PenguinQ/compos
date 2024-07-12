import { inject, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import type { Ref } from 'vue';

import { useQuery, useMutation } from '@/database/hooks';
import { getSalesDetail, mutateDeleteSales } from '@/database/query/sales';

import { salesDetailNormalizer } from '../normalizer/SalesDetail.normalizer';
import type { SalesDetailNormalizerReturn } from '../normalizer/SalesDetail.normalizer';

export const useSalesDetail = () => {
  const route = useRoute();
  const router = useRouter();
  const toast = inject('ToastProvider');
  const { params } = route;
  const dialog_delete = ref(false);

  const {
    data,
    refetch,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['sales-detail', params.id],
    queryFn: () => getSalesDetail({
      id: params.id as string,
      normalizer: salesDetailNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting sales detail, ${error}`, type: 'error' });
      console.error('[ERROR] Error getting sales detail.', error);
    },
  });

  const {
    mutate: mutateDelete,
    isLoading: mutateDeleteLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteSales(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the sales', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to delete the sales', error);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Sales deleted.', type: 'success', duration: 2000 });
      router.back();
    }
  });

  return {
    sales_id: params.id,
    dialog_delete,
    data: data as Ref<SalesDetailNormalizerReturn>,
    isError,
    isLoading,
    refetch,
    mutateDelete,
    mutateDeleteLoading,
  };
};
