import { reactive, ref, inject } from 'vue';
import type { Ref } from 'vue';

import { useQuery } from '@/database/hooks';
import { getSalesList } from '@/database/query/sales';
import { debounce } from '@helpers';

import { salesListNormalizer } from '../normalizer/SalesList.normalizer';
import type { SalesListNormalizerReturn } from '../normalizer/SalesList.normalizer';

export const useSalesList = (status: 'running' | 'finished' = 'running') => {
  const toast = inject('ToastProvider');
  const search_query = ref('');
  const isSalesEmpty = ref(true);
  const page = reactive({
    current: 1,
    total: 1,
    limit: 10,
    first: true,
    last: true,
  });

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
      status,
      limit: page.limit,
      page: page.current,
      normalizer: salesListNormalizer,
    }),
    onError: (error: Error) => {
      // @ts-ignore
      toast.add({ message: 'Failed to get product list.', type: 'error', duration: 2000 });
      console.error('Failed to get product list:', error);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, sales } = response as SalesListNormalizerReturn;

        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        isSalesEmpty.value = sales.length ? false : true;
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

    !page.first && salesRefetch();
  };

  const toNextPage = (e: Event, toLast?: boolean) => {
    if (toLast) {
      page.current = page.total;
    } else {
      if (page.current < page.total) page.current += 1;
    }

    !page.last && salesRefetch();
  };


  return {
    data: data as Ref<SalesListNormalizerReturn>,
    search_query,
    handleSearch,
    isSalesEmpty,
    salesError,
    salesLoading,
    salesRefetch,
    toNextPage,
    toPrevPage,
    page,
  };
};
