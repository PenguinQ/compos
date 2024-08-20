import { computed, inject, ref } from 'vue';
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
import { debounce } from '@helpers';

export const useProductList = (type: 'product' | 'bundle') => {
  const { page, toNext, toPrev } = usePagination();
  const toast = inject('ToastProvider');
  const searchQuery = ref('');
  const isListEmpty = ref(true);
  const currentPage = computed(() => page.current);

  const {
    data: list,
    refetch: listRefetch,
    isLoading: listLoading,
    isError: listError,
  } = useQuery({
    delay: 300,
    queryKey: [
      type === 'product' ? 'product-list' : 'bundle-list',
      searchQuery,
      currentPage,
    ],
    queryFn: () => type === 'product' ? getProductList({
      search_query: searchQuery.value,
      sort: 'desc',
      limit: page.limit,
      page: page.current,
      complete: true,
      normalizer: productListNormalizer,
    }) : getBundleList({
      search_query: searchQuery.value,
      sort: 'desc',
      limit: page.limit,
      page: page.current,
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

    page.current = 1;
    searchQuery.value = target.value;
  });

  return {
    list: list as Ref<ProductListNormalizerReturn & BundleListNormalizerReturn>,
    searchQuery,
    page,
    listError,
    listLoading,
    listRefetch,
    handleSearch,
    isListEmpty,
    toNext,
    toPrev,
  };
};
