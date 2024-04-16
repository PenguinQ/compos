import { inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getBundleDetail, mutateDeleteBundle } from '@/database/query/bundle';
import { useQuery, useMutation } from '@/database/hooks';

import { bundleDetailNormalizer } from '../normalizer/BundleDetail.normalizer';

export const useBundleDetail = () => {
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
    queryFn: () => getBundleDetail({
      id: params.id as string,
      normalizer: bundleDetailNormalizer,
    }),
    onError: (error: Error) => {
      console.error('[ERROR] Failed to get the bundle detail.', error);
      toast.add({ message: 'Failed to get the bundle detail.', type: 'error', duration: 2000 });
    },
  });

  const {
    mutate: deleteBundle,
    isLoading: deleteBundleLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteBundle(params.id as string),
    onError: (error: Error) => {
      console.error('[ERROR] Failed to delete the bundle', error);
      toast.add({ message: error, type: 'error', duration: 2000 });
    },
    onSuccess: () => {
      toast.add({ message: 'Bundle deleted', type: 'success', duration: 2000 });
      router.back();
    }
  });

  return {
    bundleID: params.id,
    data,
    dialog_delete,
    isError,
    isLoading,
    isSuccess,
    deleteBundle,
    deleteBundleLoading,
    refetch,
  };
};
