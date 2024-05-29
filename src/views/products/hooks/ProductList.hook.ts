import { inject, ref, reactive } from 'vue';
import type { Ref } from 'vue';

// Databases
import { useQuery } from '@/database/hooks';
import { getProductList } from '@/database/query/product';
import { getBundleList } from '@/database/query/bundle';

// Normalizers
import { productListNormalizer } from '../normalizer/ProductList.normalizer';
import { bundleListNormalizer } from '../normalizer/BundleList.normalizer';
import type { ProductListNormalizerReturn } from '../normalizer/ProductList.normalizer';
import type { BundleListNormalizerReturn } from '../normalizer/BundleList.normalizer';

// Helpers
import { debounce } from '@helpers';

export const useProductList = (type: 'product' | 'bundle') => {
  const toast = inject('ToastProvider');
  const search_query = ref('');
  const page = reactive({
    current: 1,
    total: 1,
    limit: 12,
    first: true,
    last: true,
  });
  const isListEmpty = ref(true);

  const {
    data: list,
    refetch: listRefetch,
    isLoading: listLoading,
    isError: listError,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => type === 'product' ? getProductList({
      search_query: search_query.value,
      sort: 'asc',
      limit: page.limit,
      page: page.current,
      complete: true,
      normalizer: productListNormalizer,
    }) : getBundleList({
      search_query: search_query.value,
      sort: 'desc',
      limit: page.limit,
      page: page.current,
      normalizer: bundleListNormalizer,
    }),
    delay: 300,
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
    search_query.value = target.value;
  });

  const toPrevPage = (_e: Event, toFirst?: boolean) => {
    if (toFirst) {
      page.current = 1;
    } else {
      if (page.current > 1) page.current -= 1;
    }

    !page.first && listRefetch();
  };

  const toNextPage = (_e: Event, toLast?: boolean) => {
    if (toLast) {
      page.current = page.total;
    } else {
      if (page.current < page.total) page.current += 1;
    }

    !page.last && listRefetch();
  };

  return {
    list: list as Ref<ProductListNormalizerReturn & BundleListNormalizerReturn>,
    search_query,
    page,
    listError,
    listLoading,
    listRefetch,
    handleSearch,
    isListEmpty,
    toNextPage,
    toPrevPage,
  };
};
