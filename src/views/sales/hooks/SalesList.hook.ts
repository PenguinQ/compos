import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
import { cleanWhitespace, debounce } from '@/helpers';

import type { TabDataProvider } from '@/views/sales/SalesList.vue';

export const useSalesList = (status: 'running' | 'finished' = 'running') => {
  const { tabData, updateTabData } = inject('TabData') as TabDataProvider;
  const toast = inject('ToastProvider');
  const route = useRoute();
  const router = useRouter();
  const isSalesEmpty = ref(true);
  const searchQuery = ref(tabData[status].search ? tabData[status].search : '');
  const { page, toNext, toPrev } = usePagination({ current: tabData[status].page });
  const currentPage = computed(() => tabData[status].page);
  const currentSearch = computed(() => tabData[status].search);

  /**
   * -------------------------------------------------------------------
   * Watcher to update searchQuery value when navigating through history
   * -------------------------------------------------------------------
   */
  watch(
    () => route.query.search,
    (newSearch) => {
      searchQuery.value = newSearch ? String(newSearch) : '';
    },
  );

  const {
    data,
    refetch: salesRefetch,
    isLoading: salesLoading,
    isError: salesError,
  } = useQuery({
    delay: 300,
    queryKey: ['sales-list', searchQuery, status, currentPage],
    queryFn: () => getSalesList({
      search_query: currentSearch.value,
      sort: 'desc',
      status,
      limit: 10,
      page: currentPage.value,
      normalizer: salesListNormalizer,
    }),
    onError: (error: Error) => {
      // @ts-ignore
      toast.add({ message: 'Failed to get sales list.', type: 'error', duration: 2000 });
      console.error('Failed to get sales list:', error);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, sales } = response as SalesListNormalizerReturn;

        page.current = response_page.current;
        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        isSalesEmpty.value = sales.length ? false : true;
      }
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = cleanWhitespace(target.value);

    page.current = 1;
    searchQuery.value = target.value;
    // Update provider
    updateTabData(status, { search: value ? value : undefined, page: 1 });
    // Update route query
    router.push({
      query: {
        ...route.query,
        search: value ? value : undefined,
        page: 1,
      },
    });
  });

  const handleSearchClear = () => {
    // Update provider
    updateTabData(status, { search: undefined, page: 1 });
    // Update route query
    router.push({
      query: {
        ...route.query,
        search: undefined,
        page: 1,
      }
    });
  };

  const handlePaginationPrev = (first?: boolean) => {
    first ? toPrev(true) : toPrev();
    // Update provider
    updateTabData(status, { page: first ? 1 : page.current })
    // Update route query
    router.push({
      query: {
        ...route.query,
        page: first ? 1 : page.current,
      },
    });
  };

  const handlePaginationNext = (last?: boolean) => {
    last ? toNext(true) : toNext();
    // Update context
    updateTabData(status, { page: last ? page.total : page.current })
    // Update route query
    router.push({
      query: {
        ...route.query,
        page: last ? page.total : page.current
      },
    });
  };

  return {
    data: data as Ref<SalesListNormalizerReturn>,
    searchQuery,
    page,
    salesError,
    salesLoading,
    isSalesEmpty,
    handleSearch,
    handleSearchClear,
    handlePaginationPrev,
    handlePaginationNext,
    salesRefetch,
  };
};
