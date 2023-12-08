import { ref, reactive } from 'vue';
import { useQuery, useMutation } from '@database/hooks';
import { queryRx, mutateRx } from '@helpers/fetcher';

export const useBundle = () => {
  const selector = ref<any>({
    id: {
      $gte: ''
    },
  });
  const bundles = ref([]);
  const deleteID = ref<string | null>(null);
  const stopQuery = ref(false);
  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => queryRx({
      collection: 'bundle',
      query: {
        selector: selector.value,
        sort: [
          { id: 'desc' },
        ],
        limit: 5,
      },
    }),
    onError: (error: any) => {
      console.log('Failed to get bundles data', error);
    },
    onSuccess: (result: any) => {
      if (result.length) {
        const lastID = result[result.length - 1]._data.id;

        selector.value = {
          /**
           * "created_at $ne = ''" are used to force return any results from query since somehow
           * when using ULID as unique identifier and sorting descending "id" doesn't return
           * any next expected data for pagination.
           *
           * Check for this in the future.
           */
          created_at: {
            $ne: '',
          },
          id: {
            $lt: lastID,
          },
        };

        bundles.value.push(...result);
      } else {
        stopQuery.value = true;
      }
    },
  });

  const {
    mutate: mutateRemove,
    isLoading: mutateRemoveLoading,
  } = useMutation({
    mutateFn: () => mutateRx({
      method: 'delete',
      collection: 'bundle',
      query: {
        selector: {
          id: {
            $eq: deleteID.value,
          },
        },
      },
    }),
    onError: (error: any) => {
      console.log('Failed to remove product.', error);
    },
    onSuccess: () => {
      console.log('Success to remove product');

      const index = bundles.value.findIndex((data: any) => data.id === deleteID.value);

      bundles.value.splice(index, 1);
    },
  });

  const nextPage = () => {
    if (!stopQuery.value) refetch();
  };

  return {
    deleteID,
    data,
    bundles,
    isError,
    isLoading,
    isSuccess,
    mutateRemoveLoading,
    mutateRemove,
    nextPage,
  };
};
