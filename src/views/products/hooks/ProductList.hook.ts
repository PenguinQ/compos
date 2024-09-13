import { computed, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery } from '@/database/hooks';
import { getProductList } from '@/database/query/product';
import { getBundleList } from '@/database/query/bundle';

// Common View Hooks
import { usePagination } from '@/views/hooks';

// Normalizers
import { productListNormalizer } from '../normalizer/ProductList.normalizer';
import { bundleListNormalizer } from '../normalizer/BundleList.normalizer';
import type { ProductListNormalizerReturn } from '../normalizer/ProductList.normalizer';
import type { BundleListNormalizerReturn } from '../normalizer/BundleList.normalizer';

// Common Helpers
import { cleanWhitespace, debounce } from '@/helpers';

import type { TabDataProvider } from '@/views/products/ProductList.vue';

export const useProductList = (type: 'product' | 'bundle') => {
  const { tabData, updateTabData } = inject('TabData') as TabDataProvider;
  const toast = inject('ToastProvider');
  const route = useRoute();
  const router = useRouter();
  const isListEmpty = ref(true);
  const searchQuery = ref(tabData[type].search);
  const { page, toNext, toPrev } = usePagination({ current: tabData[type].page });
  const currentPage = computed(() => tabData[type].page);
  const currentSearch = computed(() => tabData[type].search);

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
    data: list,
    refetch: listRefetch,
    isLoading: listLoading,
    isError: listError,
  } = useQuery({
    delay: 300,
    queryKey: [
      type === 'product' ? 'product-list' : 'bundle-list',
      currentSearch,
      currentPage,
    ],
    queryFn: () => type === 'product' ? getProductList({
      search_query: currentSearch.value,
      sort: 'desc',
      limit: page.limit,
      page: currentPage.value,
      complete: true,
      normalizer: productListNormalizer,
    }) : getBundleList({
      search_query: currentSearch.value,
      sort: 'desc',
      limit: page.limit,
      page: currentPage.value,
      normalizer: bundleListNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list,', type: 'error', duration: 2000 });
      console.error('Failed to get product list,', error);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, products, bundles } = response as ProductListNormalizerReturn & BundleListNormalizerReturn;

        page.current = response_page.current;
        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        if (type === 'product') {
          isListEmpty.value = products.length ? false : true;
        } else {
          isListEmpty.value = bundles.length ? false : true;
        }
      }
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = cleanWhitespace(target.value);

    page.current = 1;
    searchQuery.value = target.value;
    // Update provider
    updateTabData(type, { search: value ? value : undefined, page: 1 });
    // Update route query
    router.push({
      query: {
        ...route.query,
        search: value ? value : undefined,
        page: 1,
      },
    });
  }, 500);

  const handleSearchClear = () => {
    // Update provider
    updateTabData(type, { search: undefined, page: 1 });
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
    updateTabData(type, { page: first ? 1 : page.current })
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
    // Update provider
    updateTabData(type, { page: last ? page.total : page.current })
    // Update route query
    router.push({
      query: {
        ...route.query,
        page: last ? page.total : page.current
      },
    });
  };

  return {
    list: list as Ref<ProductListNormalizerReturn & BundleListNormalizerReturn>,
    searchQuery,
    page,
    listError,
    listLoading,
    listRefetch,
    handleSearch,
    handleSearchClear,
    isListEmpty,
    handlePaginationPrev,
    handlePaginationNext,
  };
};
