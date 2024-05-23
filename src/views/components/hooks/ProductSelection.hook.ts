import { reactive, computed, ref, inject } from 'vue';
import type { Ref } from 'vue';

import { useQuery } from '@/database/hooks';
import { getProductList } from '@/database/query/product';
import { getBundleList } from '@/database/query/bundle';
import { debounce } from '@helpers';

import { productListNormalizer, bundleListNormalizer } from '../normalizer/ProductSelection.normalizer';
import type { ProductListNormalizerReturn } from '../normalizer/ProductSelection.normalizer';

export const useProductSelection = () => {
  const toast = inject('ToastProvider');
  const load_product = ref(false);
  const load_bundle = ref(false);
  const dialog = ref(false);
  const search_query = ref('');

  const {
    data: productsData,
    refetch: productsRefetch,
    isPending: productsPending,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    enabled: load_product,
    delay: 2000,
    queryFn: () => getProductList({
      active: true,
      sort: 'asc',
      limit: 10,
      page: 1,
      complete: true,
      normalizer: productListNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list.', type: 'error', duration: 2000 });
      console.error('Failed to get product list:', error);
    },
    onSuccess: (response: unknown) => {
      console.log('Product', response);
    },
  });

  const {
    data: bundlesData,
    refetch: bundlesRefetch,
    isLoading: bundlesLoading,
    isError: bundlesError,
  } = useQuery({
    enabled: load_bundle,
    queryFn: () => getBundleList({
      active: true,
      sort: 'asc',
      limit: 10,
      page: 1,
      normalizer: bundleListNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list.', type: 'error', duration: 2000 });
      console.error('Failed to get product list:', error);
    },
    onSuccess: (response: unknown) => {
      console.log('Bundle', response);
    },
  });

  return {
    dialog,
    load_product,
    load_bundle,
    search_query,
    productsData: productsData as Ref<ProductListNormalizerReturn>,
    productsError,
    productsLoading,
    productsPending,
    bundlesData,
    bundlesLoading,
    bundlesError,
    productsRefetch,
    bundlesRefetch,
  };
};
