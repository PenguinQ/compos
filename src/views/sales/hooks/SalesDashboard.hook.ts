import { ref } from 'vue';
import { useQuery } from '@database/hooks';
import { getSalesList } from '@database/query/sales';
import { debounce } from '@helpers';

import { salesListNormalizer } from '../normalizer/SalesDashboard.normalizer';

export const useSalesList = () => {
  const page = ref(1);
  const total_page = ref(1);
  const search_query = ref('');
  const stop_refetch = ref(false);

  const {
    data,
    refetch: salesRefetch,
    isLoading: salesLoading,
    isError: salesError,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => getSalesList({
      search_query: search_query.value,
      sort: 'desc',
      limit: 2,
      page: page.value,
      normalizer: salesListNormalizer,
    }),
    onError: (error: string) => {
      console.log('[ERROR] Failed to get sales list:', error);
    },
    onSuccess: (response: any) => {
      console.log('[SUCCESS] Sales list:', response);

      const { total_page: total, sales } = response;

      total_page.value = total;

      if (!sales.length) stop_refetch.value = true;
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

    !first_page && salesRefetch();
  };

  const toNextPage = (e: Event, toLast?: boolean) => {
    const { last_page, total_page } = data.value;

    if (toLast) {
      page.value = total_page;
    } else {
      page.value += 1;
    }

    !last_page && salesRefetch();
  };


  return {
    data,
    page,
    total_page,
    search_query,
    handleSearch,
    salesRefetch,
    salesLoading,
    salesError,
    toNextPage,
    toPrevPage,
  };
};
