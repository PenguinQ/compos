import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { getBundleDetail, mutateDeleteBundle } from '@/database/query/bundle';
import { useQuery, useMutation } from '@/database/hooks';

// Normalizers
import { bundleDetailNormalizer } from '../normalizer/BundleDetail.normalizer';
import type { BundleDetailNormalizerReturn } from '../normalizer/BundleDetail.normalizer';

export const useBundleDetail = () => {
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
    queryKey: ['bundle-details', params.id],
    queryFn: () => getBundleDetail({
      id: params.id as string,
      normalizer: bundleDetailNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the bundle detail.', type: 'error', duration: 2000 });
      console.error('Failed to get the bundle detail.', error.message);
    },
    onSuccess: resp => {
      console.log(resp);
    },
  });

  const {
    mutate   : deleteBundle,
    isLoading: deleteBundleLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteBundle(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete the bundle.', type: 'error', duration: 2000 });
      console.error('Failed to delete the bundle.', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Bundle deleted.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  return {
    bundleId: params.id,
    data    : data as Ref<BundleDetailNormalizerReturn>,
    dialogDelete,
    isError,
    isLoading,
    isSuccess,
    deleteBundle,
    deleteBundleLoading,
    refetch,
  };
};
