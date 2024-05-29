import { reactive, inject } from 'vue';
import { useRoute } from 'vue-router';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getBundleDetail, mutateAddBundle, mutateEditBundle } from '@/database/query/bundle';

// Normalizers
import { bundleFormNormalizer, formDetailNormalizer } from '../normalizer/BundleForm.normalizer'

type FormErrorProducts = {
  quantity: string;
};

type FormError = {
  name: string;
  products: FormErrorProducts[];
};

export const useBundleForm = () => {
  const route = useRoute();
  const toast = inject('ToastProvider');
  const { params } = route;
  const form_data = reactive<any>({
    name: '',
    description: '',
    price: '',
    products: [],
    deleted_products: [],
  });
  const form_error = reactive<FormError>({
    name: '',
    products: [],
  });

  const {
    refetch: bundleDetailRefetch,
    isError: bundleDetailError,
    isLoading: bundleDetailLoading,
  } = useQuery({
    queryFn: () => getBundleDetail({
      id: params.id as string,
      normalizer: formDetailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting the bundle detail, ${error}`, type: 'error' });
      console.error('[ERROR] Error getting the bundle detail,', error);
    },
    onSuccess: (response: unknown) => {
      const resp = response as any;

      if (params.id) {
        form_data.name         = resp.name;
        form_data.description  = resp.description;
        form_data.price        = resp.price;

        resp.products.forEach((p: any) => {
          form_data.products.push({
            id: p.id,
            image: p.image,
            name: p.name,
            quantity: p.quantity,
          });
        });
      }
    },
  });

  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    queryFn: () => ({}),
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error adding new bundle, ${error}`, type: 'error' });
      console.error('[ERROR] Error adding new bundle,', error);
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
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error updating the bundle, ${error}`, type: 'error' });
      console.error('[ERROR] Error updating the bundle,', error);
    },
    onSuccess: (response: any) => {
      console.log(response);
    },
  });

  return {
    bundle_id: params.id,
    form_data,
    bundleDetailError,
    bundleDetailLoading,
    bundleDetailRefetch,
    mutateAdd,
    mutateAddLoading,
    mutateEdit,
    mutateEditLoading
  };
};
