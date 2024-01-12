import { reactive } from 'vue';
import { useRoute } from 'vue-router';

import { useQuery, useMutation } from '@/database/hooks';
import { getBundleDetail, mutateAddBundle, mutateEditBundle } from '@/database/query/bundle';
import { bundleFormNormalizer } from '../normalizer/BundleForm.normalizer'

export const useBundleForm = () => {
  const route = useRoute();
  const { params } = route;
  const formData = reactive<any>({
    name: '',
    description: '',
    price: '',
    product: [],
    deleted_product: [],
  });

  const {
    data,
    refetch: detailRefetch,
    isLoading: detailLoading,
  } = useQuery({
    queryFn: () => getBundleDetail({
      id: params.id,
      normalizer: bundleFormNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: (error: string) => {
      console.log(error);
    },
    onSuccess: (response: any) => {
      if (params.id) {
        formData.name        = response.name;
        formData.description = response.description;
        formData.price       = response.price;
        formData.product     = response.product;
      }
    },
  });

  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    queryFn: () => ({}),
    onError: (error: string) => {
      console.log(error);
    },
    onSuccess: (response: any) => {
      console.log(response);
    },
  });

  const {
    mutate: mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    queryFn: () => ({}),
    onError: (error: string) => {
      console.log(error);
    },
    onSuccess: (response: any) => {
      console.log(response);
    },
  });

  return {
    bundleID: params.id,
    formData,
    data,
    detailLoading,
    detailRefetch,
    mutateAdd,
    mutateAddLoading,
    mutateEdit,
    mutateEditLoading
  };
};
