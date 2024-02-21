import { ref } from 'vue';
import { useQuery } from '@database/hooks';
import getBundleList from '@/database/query/bundle/getBundleList';
import { debounce } from '@helpers';

import { bundleListNormalizer } from '../normalizer/BundleList.normalizer';

export const useBundle = () => {
  const deleteID = ref<string | null>(null);
  const search_query = ref('');
  const page = ref(1);
  const total_page = ref();
  const stop_refetch = ref(false);

  const {
    data,
    refetch: bundlesRefetch,
    isError: bundlesError,
    isLoading: bundlesLoading,
    isSuccess: bundlesSuccess,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => getBundleList({
      observe: true,
      search_query: search_query.value,
      sort: 'desc',
      limit: 1,
      page: page.value,
      normalizer: bundleListNormalizer,
    }),
    onError: (error: string) => {
      console.log('[ERROR] Failed to get bundle list:', error);
    },
    onSuccess: (response: any) => {
      console.log('[SUCCESS] Bundle list:', response);

      const { total_page: total, bundles } = response;

      total_page.value = total;

      if (!bundles.length) stop_refetch.value = true;
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

    !first_page && bundlesRefetch();
  };

  const toNextPage = (e: Event, toLast?: boolean) => {
    const { last_page, total_page } = data.value;

    if (toLast) {
      page.value = total_page;
    } else {
      page.value += 1;
    }

    !last_page && bundlesRefetch();
  };

  return {
    deleteID,
    data,
    search_query,
    page,
    total_page,
    bundlesRefetch,
    bundlesError,
    bundlesLoading,
    bundlesSuccess,
    handleSearch,
    toNextPage,
    toPrevPage,
  };
};
