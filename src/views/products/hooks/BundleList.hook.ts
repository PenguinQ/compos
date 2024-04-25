import { inject, ref, reactive } from 'vue';
import type { Ref } from 'vue';

import { useQuery } from '@/database/hooks';
import getBundleList from '@/database/query/bundle/getBundleList';
import { debounce } from '@helpers';

import { bundleListNormalizer } from '../normalizer/BundleList.normalizer';
import type { BundleListNormalizerReturn } from '../normalizer/BundleList.normalizer';

export const useBundle = () => {
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
    refetch: bundlesRefetch,
    isError: bundlesError,
    isLoading: bundlesLoading,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => getBundleList({
      observe: true,
      search_query: search_query.value,
      sort: 'asc',
      limit: page.limit,
      page: page.current,
      normalizer: bundleListNormalizer,
    }),
    delay: 200,
    onError: (error: Error) => {
      console.error('Failed to get bundle list:', error);
      toast.add({ message: 'Failed to get bundle list.', type: 'error', duration: 2000 });
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page, bundles } = response as BundleListNormalizerReturn;

        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;

        if (!bundles.length) stop_refetch.value = true;
      }
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;

    page.current = 1;
    search_query.value = target.value;
  });

  const toPrevPage = (e: Event, toFirst?: boolean) => {
    if (toFirst) {
      page.current = 1;
    } else {
      if (page.current > 1) page.current -= 1;
    }

    !page.first && bundlesRefetch();
  };

  const toNextPage = (e: Event, toLast?: boolean) => {
    if (toLast) {
      page.current = page.total;
    } else {
      if (page.current < page.total) page.current += 1;
    }

    !page.last && bundlesRefetch();
  };

  return {
    data: data as Ref<BundleListNormalizerReturn>,
    search_query,
    page,
    bundlesRefetch,
    bundlesError,
    bundlesLoading,
    handleSearch,
    toNextPage,
    toPrevPage,
  };
};
