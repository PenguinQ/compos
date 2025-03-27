import { inject, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import {
  getSaleDetail,
  mutateDeleteSale,
  mutateFinishSale,
} from '@/database/query/sale';
import { mutateCancelOrder } from '@/database/query/order';

// Normalizers
import { detailNormalizer } from '../normalizer/SaleDetail.normalizer';
import type { DetailNormalizerReturn } from '../normalizer/SaleDetail.normalizer';

export const useSaleDetail = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const dialog = reactive({
    cancel: false,
    delete: false,
    finish: false,
  });
  const cancelDetail = reactive({
    id  : '',
    name: '',
  });

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
      toast.add({ message: 'Error getting sale detail', type: 'error' });
      console.error('Error getting sale detail,', error.message);
    },
  });

  const {
    mutate   : mutateDelete,
    isLoading: isMutateDeleteLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteSale(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the sale', type: 'error', duration: 2000 });
      console.error('Failed to delete the sale,', error.message);
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
      toast.add({ message: 'Failed to finish the sale', type: 'error', duration: 2000 });
      console.error('Failed to delete the sale,', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `Sale ${response} finished`, type: 'success', duration: 2000 });

      dialog.finish = false;
      refetch();
    },
  });

  const {
    mutate   : mutateCancelOrderFn,
    isLoading: isMutateCancelOrderFnLoading,
  } = useMutation({
    mutateFn: (data) => mutateCancelOrder(data?.id),
    onError: (error, variables) => {
      // @ts-ignore
      toast.add({ message: `Failed to cancel the order ${variables?.name}, ${error.message}`, type: 'error', duration: 2000 });
      console.error(`Failed to cancel the order, ${variables?.name}`, error.message);
    },
    onSuccess: (_, variables) => {
      // @ts-ignore
      toast.add({ message: `Order ${variables?.name} cancelled`, type: 'success', duration: 2000 });

      dialog.cancel = false;
      refetch();
    },
  });

  const handleCancelOrder = (id: string, name: string) => {
    cancelDetail.id   = id;
    cancelDetail.name = name;
    dialog.cancel     = true;
  };

  const handleRefresh = async (e: any) => {
    await refetch();
    e.complete();
  };

  return {
    saleId: params.id,
    data  : data as Ref<DetailNormalizerReturn>,
    dialog,
    cancelDetail,
    isError,
    isLoading,
    isMutateDeleteLoading,
    isMutateFinishLoading,
    isMutateCancelOrderFnLoading,
    refetch,
    mutateCancelOrderFn,
    mutateDelete,
    mutateFinish,
    handleCancelOrder,
    handleRefresh,
  };
};
