import {
  ref,
  reactive,
  toRefs,
  computed,
  watch,
  onBeforeUnmount,
} from 'vue';
import type { Ref } from 'vue';
import type { Observable, Subscription } from 'rxjs';
import type { RxDocument } from 'rxdb';
import type { NormalizerData, QueryReturn } from '@/database/types';

type UseQueryParams = {
  delay?: number,
  enabled?: boolean;
  queryKey?: Ref<string>[],
  queryFn: () => Promise<QueryReturn>;
  onError?: (response: Error) => void;
  onSuccess?: (response: object | undefined) => void;
};

type UseMutateParams = {
  mutateFn: () => Promise<void>;
  onError?: (response: Error) => void;
  onSuccess?: (response?: unknown) => void;
};

export const useQuery = (params: UseQueryParams) => {
  const {
    enabled = true,
    delay = false,
    queryKey = [],
    queryFn,
    onError,
    onSuccess,
  } = params;
  // const query_enabled = isRef(enabled) ? enabled : ref(enabled);
  // const query_key = isRef(queryKey) ? queryKey : ref(queryKey);
  const query_enabled = computed(() => enabled);
  const query_key = computed(() => queryKey);
  const states = reactive({
    data: undefined as undefined | object,
    isError: false,
    isLoading: false,
    isSuccess: false,
  });
  const subscribed_result = ref<Subscription>();
  let delayTimeout: ReturnType<typeof setTimeout>;

  const query = async () => {
    try {
      states.isLoading = true;

      if (delay) clearTimeout(delayTimeout);

      const { normalizer, observeable, observeableProcessor, result } = await queryFn();

      if (observeable) {
        if (!observeableProcessor) throw Error('Observable must have observeableProcessor');

        subscribed_result.value?.unsubscribe();
        subscribed_result.value = (result as Observable<unknown>).subscribe({
          next: async (data) => {
            const processed_data = await observeableProcessor(data as RxDocument<unknown>[]) as NormalizerData;
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
      } else {
        if (delay) {
          delayTimeout = setTimeout(() => {
            states.isLoading = false;
            states.isError = false;
            states.isSuccess = true;
            states.data = result as object;

            if (onSuccess) onSuccess(states.data);
          }, delay);
        } else {
          states.isLoading = false;
          states.isError = false;
          states.isSuccess = true;
          states.data = result as object;

          if (onSuccess) onSuccess(states.data);
        }
      }
    } catch (error) {
      states.isLoading = false;
      states.isError = true;
      states.isSuccess = false;

      if (onError) onError(error as Error);
    }
  };

  const unsubscribe = () => subscribed_result.value?.unsubscribe();

  onBeforeUnmount(() => {
    if (subscribed_result.value) subscribed_result.value.unsubscribe();
  });

  watch(
    query_key,
    () => {
      if (query_enabled.value) query();
    },
    { deep: true },
  );

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
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  const mutate = async () => {
    states.isLoading = true;

    try {
      await mutateFn();

      states.isLoading = false;
      states.isError = false;
      states.isSuccess = true;

      if (onSuccess) onSuccess();
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
