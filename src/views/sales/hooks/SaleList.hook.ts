import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Databases
import { useQuery } from '@/database/hooks';
import { getSaleList } from '@/database/query/sale';

// Common View Hooks
import { usePagination } from '@/views/hooks';

// Normalizers
import { saleListNormalizer } from '../normalizer/SaleList.normalizer';

// Common Helpers
import { cleanWhitespace, debounce } from '@/helpers';

import type { TabDataProvider } from '@/views/sales/SaleList.vue';

export const useSaleList = (status: 'running' | 'finished' = 'running') => {
  const { tabData, updateTabData } = inject('TabData') as TabDataProvider;
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const isListEmpty = ref(true);
  const searchQuery = ref(tabData[status].search ? tabData[status].search : '');
  const { page, toNext, toPrev } = usePagination({ current: tabData[status].page });
  const currentPage   = computed(() => tabData[status].page);
  const currentSearch = computed(() => tabData[status].search);

  watch(
    () => route.query.search,
    (newSearch) => {
      searchQuery.value = newSearch ? String(newSearch) : '';
    },
  );

  const {
    data     : saleList,
    refetch  : saleListRefetch,
    isLoading: saleListLoading,
    isError  : saleListError,
  } = useQuery({
    delay: 300,
    queryKey: ['sale-list', searchQuery, status, currentPage],
    queryFn: () => getSaleList({
      search_query: currentSearch.value,
      page        : currentPage.value,
      limit       : 10,
      sort        : 'desc',
      status,
    }),
    queryNormalizer: saleListNormalizer,
    onError: (error) => {
      // @ts-ignore
      toast.add({ message: 'Failed to get sale list', type: 'error', duration: 2000 });
      console.error('Failed to get sale list,', error);
    },
    onSuccess: (response) => {
      if (response) {
        const { page: responsePage, sales } = response;

        page.current = responsePage.current;
        page.total   = responsePage.total;
        page.first   = responsePage.first;
        page.last    = responsePage.last;

        isListEmpty.value = sales.length ? false : true;
      }
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = cleanWhitespace(target.value);

    page.current = 1;
    searchQuery.value = target.value;

    updateTabData(status, { search: value ? value : undefined, page: 1 });

    router.push({
      query: {
        ...route.query,
        search: value ? value : undefined,
        page: 1,
      },
    });
  });

  const handleSearchClear = () => {
    updateTabData(status, { search: undefined, page: 1 });

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

    updateTabData(status, { page: first ? 1 : page.current })

    router.push({
      query: {
        ...route.query,
        page: first ? 1 : page.current,
      },
    });
  };

  const handlePaginationNext = (last?: boolean) => {
    last ? toNext(true) : toNext();

    updateTabData(status, { page: last ? page.total : page.current })

    router.push({
      query: {
        ...route.query,
        page: last ? page.total : page.current
      },
    });
  };

  return {
    saleList,
    searchQuery,
    page,
    saleListError,
    saleListLoading,
    isListEmpty,
    handleSearch,
    handleSearchClear,
    handlePaginationPrev,
    handlePaginationNext,
    saleListRefetch,
  };
};
