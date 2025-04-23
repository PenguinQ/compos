import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Databases
import { useQuery } from '@/database/hooks';
import { getProductList } from '@/database/query/product';
import { getBundleList } from '@/database/query/bundle';

// Common View Hooks
import { usePagination } from '@/views/hooks';

// Normalizers
import { productListNormalizer } from '../normalizer/ProductList.normalizer';
import { bundleListNormalizer } from '../normalizer/BundleList.normalizer';

// Helpers
import { cleanWhitespace, debounce } from '@/helpers';

import type { TabDataProvider } from '@/views/products/ProductList.vue';

export const useProductList = (type: 'product' | 'bundle') => {
  const { tabData, updateTabData } = inject('TabData') as TabDataProvider;
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const isListEmpty = ref(true);
  const searchQuery = ref(tabData[type].search ? tabData[type].search : '');
  const { page, toNext, toPrev } = usePagination({ current: tabData[type].page });
  const currentPage   = computed(() => tabData[type].page);
  const currentSearch = computed(() => tabData[type].search);

  watch(
    () => route.query.search,
    (newSearch) => {
      searchQuery.value = newSearch ? String(newSearch) : '';
    },
  );

  const {
    data     : list,
    refetch  : listRefetch,
    isLoading: listLoading,
    isError  : listError,
  } = useQuery({
    delay: 200,
    queryKey: [
      type === 'product' ? 'product-list' : 'bundle-list',
      currentSearch,
      currentPage,
    ],
    queryFn: async () => {
      if (type === 'product') {
        return await getProductList({
          search_query: currentSearch.value,
          sort: 'desc',
          limit: page.limit,
          page: currentPage.value,
          complete: true,
        });
      }

      return await getBundleList({
        search_query: currentSearch.value,
        sort: 'desc',
        limit: page.limit,
        page: currentPage.value,
      });
    },
    queryNormalizer: (data) => {
      if (type === 'product') {
        return productListNormalizer(data as Awaited<ReturnType<typeof getProductList>>);
      }
      return bundleListNormalizer(data as Awaited<ReturnType<typeof getBundleList>>);
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list', type: 'error', duration: 2000 });
      console.error('Failed to get product list,', error.message);
    },
    onSuccess: (response) => {
      if (response) {
        const { page: responsePage } = response;

        page.current = responsePage.current;
        page.total   = responsePage.total;
        page.first   = responsePage.first;
        page.last    = responsePage.last;

        if ('products' in response) {
          isListEmpty.value = response.products.length ? false : true;
        } else {
          isListEmpty.value = response.bundles.length ? false : true;
        }
      }
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    const value  = cleanWhitespace(target.value);

    page.current      = 1;
    searchQuery.value = target.value;

    updateTabData(type, { search: value ? value : undefined, page: 1 });

    router.push({
      query: {
        ...route.query,
        search: value ? value : undefined,
        page  : 1,
      },
    });
  });

  const handleSearchClear = () => {
    updateTabData(type, { search: undefined, page: 1 });

    router.push({
      query: {
        ...route.query,
        search: undefined,
        page  : 1,
      }
    });
  };

  const handlePaginationPrev = (first?: boolean) => {
    first ? toPrev(true) : toPrev();

    updateTabData(type, { page: first ? 1 : page.current })

    router.push({
      query: {
        ...route.query,
        page: first ? 1 : page.current,
      },
    });
  };

  const handlePaginationNext = (last?: boolean) => {
    last ? toNext(true) : toNext();

    updateTabData(type, { page: last ? page.total : page.current })

    router.push({
      query: {
        ...route.query,
        page: last ? page.total : page.current
      },
    });
  };

  return {
    list,
    searchQuery,
    page,
    listError,
    listLoading,
    isListEmpty,
    handleSearch,
    handleSearchClear,
    handlePaginationPrev,
    handlePaginationNext,
    listRefetch,
  };
};
