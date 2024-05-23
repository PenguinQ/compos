import { inject, ref, reactive } from 'vue';
import type { Ref } from 'vue';

import { useQuery } from '@/database/hooks';
import { getProductList } from '@/database/query/product';
import { debounce } from '@helpers';

import { productListNormalizer } from '../normalizer/ProductList.normalizer';
import type { ProductListNormalizerReturn } from '../normalizer/ProductList.normalizer';

export const useProductList = () => {
  const toast = inject('ToastProvider');
  const search_query = ref('');
  const stop_refetch = ref(false);
  const page = reactive({
    current: 1,
    total: 1,
    limit: 12,
    first: true,
    last: true,
  });

  const {
    data,
    refetch: productsRefetch,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => getProductList({
      search_query: search_query.value,
      sort: 'asc',
      limit: page.limit,
      page: page.current,
      complete: true,
      normalizer: productListNormalizer,
    }),
    delay: 200,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list.', type: 'error', duration: 2000 });
      console.error('Failed to get product list:', error);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, products } = response as ProductListNormalizerReturn;

        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        if (!products.length) stop_refetch.value = true;
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

    !page.first && productsRefetch();
  };

  const toNextPage = (_e: Event, toLast?: boolean) => {
    if (toLast) {
      page.current = page.total;
    } else {
      if (page.current < page.total) page.current += 1;
    }

    !page.last && productsRefetch();
  };

  return {
    data: data as Ref<ProductListNormalizerReturn>,
    search_query,
    page,
    productsError,
    productsLoading,
    productsRefetch,
    handleSearch,
    toNextPage,
    toPrevPage,
  };
};
