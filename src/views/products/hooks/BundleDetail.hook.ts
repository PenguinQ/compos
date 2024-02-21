import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@/database/hooks';
import getBundleDetail from '@/database/query/bundle/getBundleDetail';
import { bundleDetailNormalizer } from '../normalizer/BundleDetail.normalizer';

export const useBundleDetail = () => {
  const route = useRoute();
  const { params } = route;

  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => getBundleDetail({
      id: params.id,
      normalizer: bundleDetailNormalizer,
    }),
    onError: (error: Error) => {
      console.error('[ERROR] Failed to get the bundle detail.', error);
    },
    onSuccess: async (response: any) => {
      console.log('[SUCCESS] Bundle detail page.', response);
    },
  });

  // DON'T REMOVE!
  // const {
  //   data: productData,
  //   refetch: productRefetch,
  //   isError: productError,
  //   isLoading: productLoading,
  //   isSuccess: productSuccess,
  // } = useQuery({
  //   queryKey: [productIDs],
  //   queryFn: () => queryRx({
  //     collection: 'product',
  //     query: {
  //       selector: {
  //         id: {
  //           $in: productIDs.value,
  //         },
  //       },
  //     },
  //   }),
  //   enabled,
  //   onError: (error: any) => {
  //     console.error('Failed to get the product detail.', error);
  //   },
  //   onSuccess: (result: any) => {
  //     console.log('Success to get the bundle product detail.', result);

  //     const filtered = result.filter((res: any) => res.stock === 0);

  //     if (filtered.length) {
  //       bundleAvailable.value = false;
  //     }
  //   },
  // });

  // const mutateQuery = params.id ? {
  //   selector: {
  //     id: {
  //       $eq: params.id,
  //     },
  //   },
  // } : undefined;

  // const {
  //   mutate: mutateEdit,
  //   isLoading: mutateEditLoading,
  // } = useMutation({
  //   mutateFn: () => mutateRx({
  //     collection: 'bundle',
  //     method: 'put',
  //     query: mutateQuery,
  //     data: {
  //       name: formData.name,
  //       description: formData.description,
  //       image: formData.image,
  //       by: formData.by,
  //       price: parseInt(formData.price as any),
  //       stock: parseInt(formData.stock as any),
  //       sku: formData.sku,
  //     },
  //   }),
  //   onError: (error: any) => {
  //     console.error('Error mutating bundle detail.', error);
  //   },
  //   onSuccess: () => {
  //     console.log('Success mutating bundle detail.');
  //   },
  // });

  // const resetForm = () => {
  //   formData.name = '';
  //   formData.description = '';
  //   formData.image = '';
  //   formData.by = '';
  //   formData.price = null;
  //   formData.stock = null;
  //   formData.sku = '';
  // };

  // const {
  //   mutate: mutateAdd,
  //   isLoading: mutateAddLoading,
  // } = useMutation({
  //   mutateFn: () => mutateRx({
  //     collection: 'bundle',
  //     method: 'post',
  //     data: {
  //       name: formData.name,
  //       description: formData.description,
  //       image: formData.image,
  //       by: formData.by,
  //       price: parseInt(formData.price as any),
  //       stock: parseInt(formData.stock as any),
  //       sku: formData.sku,
  //     },
  //   }),
  //   onError: (error: any) => {
  //     console.error('Error adding new bundle.', error);
  //   },
  //   onSuccess: () => {
  //     console.log('Success adding new bundle.');
  //     resetForm();
  //   },
  // });

  return {
    bundleID: params.id,
    data,
    isError,
    isLoading,
    isSuccess,
    refetch,
  };
};
