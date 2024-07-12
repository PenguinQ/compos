import { ref, inject, toRef, computed } from 'vue';
import type { Ref } from 'vue';

// Databases
import { useQuery } from '@/database/hooks';
import { getSalesList } from '@/database/query/sales';

// Common View Hooks
import { usePagination } from '@/views/hooks';

// Normalizers
import { salesListNormalizer } from '../normalizer/SalesList.normalizer';
import type { SalesListNormalizerReturn } from '../normalizer/SalesList.normalizer';

// Common Helpers
import { debounce } from '@/helpers';

export const useSalesList = (status: 'running' | 'finished' = 'running') => {
  const { page, toNext, toPrev } = usePagination();
  const toast = inject('ToastProvider');
  const search_query = ref('');
  const isSalesEmpty = ref(true);
  const current_page = computed(() => page.current);

  /**
   * ---------------
   * Get sales list.
   * ---------------
   * Run on route(s):
   * - /sales/list
   */
  const {
    data,
    refetch: salesRefetch,
    isLoading: salesLoading,
    isError: salesError,
  } = useQuery({
    delay: 300,
    queryKey: ['sales-list', search_query, status, current_page],
    queryFn: () => getSalesList({
      search_query: search_query.value,
      sort: 'desc',
      status,
      limit: 1,
      page: page.current,
      normalizer: salesListNormalizer,
    }),
    onError: (error: Error) => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list.', type: 'error', duration: 2000 });
      console.error('Failed to get product list:', error);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, sales } = response as SalesListNormalizerReturn;

        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        isSalesEmpty.value = sales.length ? false : true;
      }
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;

    page.current = 1;
    search_query.value = target.value;
  });

  return {
    data: data as Ref<SalesListNormalizerReturn>,
    search_query,
    page,
    isSalesEmpty,
    salesError,
    salesLoading,
    handleSearch,
    salesRefetch,
    toNext,
    toPrev,
  };
};
