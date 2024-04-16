import { ref } from 'vue';
import { useQuery } from '@/database/hooks';
import { getProductList } from '@/database/query/product';
import { debounce } from '@helpers';

import { productListNormalizer } from '../normalizer/ProductList.normalizer';

export const useProductList = () => {
  const stop_refetch = ref(false);
  const page = ref(1);
  const total_page = ref();
  const search_query = ref('');

  const {
    data,
    refetch: productsRefetch,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => getProductList({
      observe: true,
      search_query: search_query.value,
      sort: 'asc',
      limit: 8,
      page: page.value,
      normalizer: productListNormalizer,
    }),
    onError: (error: Error) => {
      console.log('[ERROR] Failed to get product list:', error);
    },
    onSuccess: (response: any) => {
      console.log('[SUCCESS] Product list:', response);

      const { total_page: total, products } = response;

      total_page.value = total;

      if (!products.length) stop_refetch.value = true;
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;

    page.value = 1;

    search_query.value = target.value;
  });

  const toPrevPage = (e: Event, toFirst?: boolean) => {
    const { first_page } = data.value;

    if (toFirst) {
      page.value = 1;
    } else {
      page.value -= 1;
    }

    !first_page && productsRefetch();
  };

  const toNextPage = (e: Event, toLast?: boolean) => {
    const { last_page, total_page } = data.value;

    if (toLast) {
      page.value = total_page;
    } else {
      page.value += 1;
    }

    !last_page && productsRefetch();
  };

  return {
    data,
    search_query,
    page,
    total_page,
    productsError,
    productsLoading,
    productsRefetch,
    toNextPage,
    toPrevPage,
    handleSearch,
  };
};
