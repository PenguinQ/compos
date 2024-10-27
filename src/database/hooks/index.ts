import { computed, ref, reactive, toRefs, watch, onBeforeUnmount, isRef } from 'vue';
import type { Ref } from 'vue';
import type { Observable, Subscription } from 'rxjs';
import type { RxDocument } from 'rxdb';

// Databases
import { queryCache } from '@/database/cache/queryCache';
import type { QueryReturn } from '@/database/types';

type UseQueryParams = {
  cacheTime?: number;
  delay?: number,
  enabled?: Ref<boolean> | boolean;
  queryKey: any[],
  staleTime?: number;
  queryFn: () => Promise<QueryReturn>;
  onError?: (response: Error) => void;
  onSuccess?: (response: object | undefined) => void;
};

type UseMutateParams = {
  mutateFn: () => Promise<unknown>;
  onError?: (response: Error) => void;
  onSuccess?: (response?: unknown) => void;
};

export const useQuery = (params: UseQueryParams) => {
  const {
    cacheTime = 1000 * 60 * 5,
    delay,
    enabled = true,
    queryKey = [],
    staleTime = 0,
    queryFn,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: undefined as undefined | object,
    isError: false,
    isLoading: false,
    isSuccess: false,
  });
  const query_enabled = computed(() => isRef(enabled) ? enabled.value : enabled);
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
      states.isLoading = true;

      if (delay) clearTimeout(delayTimeout);

      const cache_key = generateKey(queryKey);
      const { data: cache_data, isStale } = queryCache.get(cache_key);

      if (cache_data) {
        if (delay) {
          delayTimeout = setTimeout(() => {
            states.data = cache_data;

            if (!isStale) {
              states.isLoading = false;
              states.isSuccess = true;

              if (onSuccess) onSuccess(states.data);

              return;
            }
          }, delay);
        } else {
          states.data = cache_data;

          if (!isStale) {
            states.isLoading = false;
            states.isSuccess = true;

            if (onSuccess) onSuccess(states.data);

            return;
          }
        }
      }

      const { result } = await queryFn();

      if (delay) {
        delayTimeout = setTimeout(() => {
          states.isError = false;
          states.isLoading = false;
          states.isSuccess = true;
          states.data = result as object;

          if (onSuccess) onSuccess(states.data);

          queryCache.set(cache_key, states.data, staleTime, cacheTime);
        }, delay);
      } else {
        states.isError = false;
        states.isLoading = false;
        states.isSuccess = true;
        states.data = result as object;

        if (onSuccess) onSuccess(states.data);

        queryCache.set(cache_key, states.data, staleTime, cacheTime);
      }
    } catch (error) {
      states.isError = true;
      states.isLoading = false;
      states.isSuccess = false;

      if (onError) onError(error as Error);
    }
  };

  // Watch changes in queryKey value and run the query if the queryKey value changes.
  watch(
    () => queryKey,
    () => {
      if (query_enabled.value) query();
    },
    { deep: true },
  );

  // Watch changes if the query enabled status are changed, and run the query if it's true.
  watch(
    query_enabled,
    (enabled) => {
      if (enabled) query();
    }
  );

  // Run query for the first time if the query is enabled.
  if (query_enabled.value) query();

  return {
    refetch: query,
    ...toRefs(states),
  };
};

export const useObservableQuery = (params: Omit<UseQueryParams, 'cache'>) => {
  const {
    enabled = true,
    delay,
    queryKey = [],
    queryFn,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: undefined as undefined | object,
    isError: false,
    isLoading: false,
    isSuccess: false,
  });
  const query_enabled = computed(() => isRef(enabled) ? enabled.value : enabled);
  const subscribed_result = ref<Subscription>();
  let delayTimeout: ReturnType<typeof setTimeout>;

  const query = async (): Promise<void> => {
    try {
      states.isLoading = true;

      if (delay) clearTimeout(delayTimeout);

      const { normalizer, observeableProcessor, result } = await queryFn();

      if (!observeableProcessor) throw Error('Observable must have observeableProcessor');

      subscribed_result.value?.unsubscribe();
      subscribed_result.value = (result as Observable<unknown>).subscribe({
        next: async (data) => {
          const processed_data = await observeableProcessor(data as RxDocument<unknown>[]);
          const normalized_data = normalizer ? normalizer(processed_data) : processed_data;

          if (delay) {
            states.isLoading = true;

            delayTimeout = setTimeout(() => {
              states.isError = false;
              states.isSuccess = true;
              states.isLoading = false;
              states.data = normalized_data as object;

              onSuccess && onSuccess(states.data);
            }, delay);
          } else {
            states.isError = false;
            states.isSuccess = true;
            states.isLoading = false;
            states.data = normalized_data as object;

            onSuccess && onSuccess(states.data);
          }
        },
      });
    } catch (error) {
      states.isError = true;
      states.isLoading = false;
      states.isSuccess = false;

      if (onError) onError(error as Error);
    }
  };

  const unsubscribe = () => subscribed_result.value?.unsubscribe();

  // Unsubscribe when unmount if the query is an observeable query.
  onBeforeUnmount(() => {
    if (subscribed_result.value) subscribed_result.value.unsubscribe();
  });

  // Watch changes in queryKey value and run the query if the queryKey value changes.
  watch(
    () => queryKey,
    () => {
      if (query_enabled.value) query();
    },
    { deep: true }
  );

  // Watch changes if the query enabled status are changed, and run the query if it's true.
  watch(
    query_enabled,
    (enabled) => {
      if (enabled) query();
    }
  );

  // Run query for the first time if the query is enabled.
  if (query_enabled.value) query();

  return {
    refetch: query,
    unsubscribe,
    ...toRefs(states),
  };
};

export const useMutation = (params: UseMutateParams) => {
  const { mutateFn, onError, onSuccess } = params;
  const states = reactive({
    data: undefined as undefined | unknown,
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  const mutate = async (): Promise<void> => {
    states.isLoading = true;

    try {
      const result = await mutateFn();

      states.isLoading = false;
      states.isError = false;
      states.isSuccess = true;
      states.data = result;

      if (onSuccess) onSuccess(states.data);
    } catch (error) {
      states.isLoading = false;
      states.isError = false;
      states.isSuccess = true;

      if (onError) onError(error as Error);
    }
  };

  return {
    mutate,
    ...toRefs(states),
  };
};
