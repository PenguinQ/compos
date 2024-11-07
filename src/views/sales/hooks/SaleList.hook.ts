import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery } from '@/database/hooks';
import { getSaleList } from '@/database/query/sale';

// Common View Hooks
import { usePagination } from '@/views/hooks';

// Normalizers
import { listNormalizer } from '../normalizer/SaleList.normalizer';
import type { ListNormalizerReturn } from '../normalizer/SaleList.normalizer';

// Common Helpers
import { cleanWhitespace, debounce } from '@/helpers';

import type { TabDataProvider } from '@/views/sales/SaleList.vue';

export const useSaleList = (status: 'running' | 'finished' = 'running') => {
  const { tabData, updateTabData } = inject('TabData') as TabDataProvider;
  const toast = inject('ToastProvider');
  const route = useRoute();
  const router = useRouter();
  const isSaleEmpty = ref(true);
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
    refetch  : saleRefetch,
    isLoading: saleLoading,
    isError  : saleError,
  } = useQuery({
    delay: 300,
    queryKey: ['sale-list', searchQuery, status, currentPage],
    queryFn: () => getSaleList({
      search_query: currentSearch.value,
      sort: 'desc',
      status,
      limit: 10,
      page: currentPage.value,
      normalizer: listNormalizer,
    }),
    onError: (error: Error) => {
      // @ts-ignore
      toast.add({ message: 'Failed to get sale list.', type: 'error', duration: 2000 });
      console.error('Failed to get sale list.', error);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, sales } = response as ListNormalizerReturn;

        page.current = response_page.current;
        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        isSaleEmpty.value = sales.length ? false : true;
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
    data: data as Ref<ListNormalizerReturn>,
    searchQuery,
    page,
    saleError,
    saleLoading,
    isSaleEmpty,
    handleSearch,
    handleSearchClear,
    handlePaginationPrev,
    handlePaginationNext,
    saleRefetch,
  };
};
