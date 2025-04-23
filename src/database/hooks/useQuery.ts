import { computed, reactive, ref, toRefs, watch, isRef } from 'vue';
import type { Ref } from 'vue';

// Databases
import { queryCache } from '@/database/cache/queryCache';

export type UseQueryParams<TData, TResult = TData> = {
  cacheTime?: number;
  delay?: number,
  enabled?: Ref<boolean> | boolean;
  queryKey?: any[],
  staleTime?: number;
  queryFn: () => Promise<TData>;
  queryNormalizer?: (data: TData) => TResult;
  onError?: (response: Error) => void;
  onSuccess?: (response?: TResult) => void;
};

export default <TData, TResult = TData>({
  enabled   = true,
  queryKey  = [],
  cacheTime = 1000 * 60 * 5,
  staleTime = 0,
  delay,
  queryFn,
  queryNormalizer,
  onError,
  onSuccess,
}: UseQueryParams<TData, TResult>) => {
  const queryData   = ref<TResult>();
  const queryStates = reactive({
    isError  : false,
    isLoading: false,
    isSuccess: false,
  });
  const queryEnabled = computed(() => isRef(enabled) ? enabled.value : enabled);
  let delayTimeout: ReturnType<typeof setTimeout>;

  const generateKey = (keys: any[]): string => {
    return keys.map(key => {
      if (typeof key === 'object' && !isRef(key)) {
        return Object.values(key).map(v => isRef(v) ? v.value : v).join('-');
      }

      return isRef(key) ? key.value : key;
    }).join('-');
  };

  const query = async (): Promise<void> => {
    try {
      queryStates.isLoading = true;

      if (delay) clearTimeout(delayTimeout);

      const cacheKey = generateKey(queryKey);
      const { data: cacheData, isStale } = queryCache.get(cacheKey);

      if (cacheData) {
        if (delay) {
          await new Promise<void>(resolve => {
            delayTimeout = setTimeout(() => {
              queryData.value = cacheData;

              if (!isStale) {
                queryStates.isLoading = false;
                queryStates.isSuccess = true;

                if (onSuccess) onSuccess(queryData.value);
              }

              resolve();
            }, delay);

            return;
          });
        } else {
          queryData.value = cacheData;

          if (!isStale) {
            queryStates.isLoading = false;
            queryStates.isSuccess = true;

            if (onSuccess) onSuccess(queryData.value);

            return;
          }
        }
      }

      const queryFnResult = await queryFn();

      if (delay) {
        await new Promise<void>(resolve => {
          delayTimeout = setTimeout(() => {
            queryStates.isError   = false;
            queryStates.isLoading = false;
            queryStates.isSuccess = true;
            queryData.value       = queryNormalizer ? queryNormalizer(queryFnResult) : queryFnResult as TResult;

            if (onSuccess) onSuccess(queryData.value);

            queryCache.set(cacheKey, queryData.value, staleTime, cacheTime);

            resolve();
          }, delay);
        });
      } else {
        queryStates.isError   = false;
        queryStates.isLoading = false;
        queryStates.isSuccess = true;
        queryData.value       = queryNormalizer ? queryNormalizer(queryFnResult) : queryFnResult as TResult;

        if (onSuccess) onSuccess(queryData.value);

        queryCache.set(cacheKey, queryData.value, staleTime, cacheTime);
      }
    } catch (error) {
      queryStates.isError   = true;
      queryStates.isLoading = false;
      queryStates.isSuccess = false;

      if (onError) onError(error as Error);
    }
  };

  // Watch changes in queryKey value and run the query if the queryKey value changes.
  watch(
    () => queryKey,
    () => {
      if (queryEnabled.value) query();
    },
    { deep: true },
  );

  // Watch changes if the query enabled status are changed, and run the query if it's true.
  watch(
    queryEnabled,
    (enabled) => {
      if (enabled) query();
    }
  );

  // Run query for the first time if the query is enabled.
  if (queryEnabled.value) query();

  return {
    data   : queryData,
    refetch: query,
    ...toRefs(queryStates),
  };
};
