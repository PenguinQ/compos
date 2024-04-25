import {
  ref,
  reactive,
  isRef,
  toRefs,
  watch,
  onBeforeUnmount,
} from 'vue';
import type { Ref } from 'vue';
import { ObservedQueryReturn } from '@/database/types';

type QueryParams = {
  delay?: number,
  enabled?: boolean;
  queryKey?: Ref<string>[],
  queryFn: () => Promise<any>;
  onError?: (response: Error) => void;
  onSuccess?: (response: object | undefined) => void;
};

export type QueryReturns = {
  data: unknown;
  isError: Ref<boolean>;
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
  refetch: () => void;
};

type MutateParams = {
  mutateFn: () => Promise<void>;
  onError?: (response: Error) => void;
  onSuccess?: (response: object) => void;
};

export type MutateReturns = {
  mutate: () => void;
  isError: Ref<boolean>;
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
};

export const useQuery = (params: QueryParams): QueryReturns => {
  const {
    enabled = true,
    delay = false,
    queryKey = [],
    queryFn,
    onError,
    onSuccess,
  } = params;
  const query_enabled = isRef(enabled) ? enabled : ref(enabled);
  const query_key = isRef(queryKey) ? queryKey : ref(queryKey);
  const states = reactive({
    data: undefined,
    isError: false,
    isLoading: false,
    isSuccess: false,
  });
  const subscribed_result = ref<any>(null);
  let delayTimeout: ReturnType<typeof setTimeout>;

  const queryV2 = async () => {
    console.log('QueryV2');

    try {
      states.isLoading = true;

      if (delay) clearTimeout(delayTimeout);

      const { normalizer, observe, preprocessor, result } = await queryFn();

      if (observe) {
        subscribed_result.value = result.subscribe(async (data: any) => {
          if (data) {
            const processed_data = preprocessor ? await preprocessor(data) : data;
            const normalized_data  = normalizer ? normalizer(processed_data) : processed_data;

            if (delay) {
              delayTimeout = setTimeout(() => {
                states.isError = false;
                states.isSuccess = true;
                states.isLoading = false;
                states.data = normalized_data;

                onSuccess && onSuccess(states.data);
              }, delay);
            } else {
              states.isError = false;
              states.isSuccess = true;
              states.isLoading = false;
              states.data = normalized_data;

              onSuccess && onSuccess(states.data);
            }
          }
        });
      } else {
        if (delay) {
          delayTimeout = setTimeout(() => {
            states.isLoading = false;
            states.isError = false;
            states.isSuccess = true;
            states.data = result;

            if (onSuccess) onSuccess(states.data);
          }, delay);
        } else {
          states.isLoading = false;
          states.isError = false;
          states.isSuccess = true;
          states.data = result;

          if (onSuccess) onSuccess(states.data);
        }
      }
    } catch (error: unknown) {
      states.isLoading = false;
      states.isError = false;
      states.isSuccess = true;

      if (onError) onError(error as Error);
    }
  };

  const query = () => {
    console.log('QueryV1');

    states.isLoading = true;

    if (delay) clearTimeout(delayTimeout);

    queryFn().then((response: unknown) => {
      const { observe, result } = response as ObservedQueryReturn;

      if (observe) {
        const { normalizer, preprocessor } = response as ObservedQueryReturn;

        subscribed_result.value = result.subscribe(async (data: any) => {
          if (data) {
            const processed_data = preprocessor ? await preprocessor(data) : data;
            const normalized_data  = normalizer ? normalizer(processed_data) : processed_data;

            if (delay) {
              delayTimeout = setTimeout(() => {
                states.isError = false;
                states.isSuccess = true;
                states.isLoading = false;
                states.data = normalized_data;

                onSuccess && onSuccess(states.data);
              }, delay);
            } else {
              states.isError = false;
              states.isSuccess = true;
              states.isLoading = false;
              states.data = normalized_data;

              onSuccess && onSuccess(states.data);
            }
          }
        });

        // Old
        // subscribed_result.value = result.subscribe(async (data: any) => {
        //   if (data) {
        //     const processed_data = preprocessor ? await preprocessor(data) : data;
        //     const normalized_data  = normalizer ? normalizer(processed_data) : processed_data;

        //     states.isError = false;
        //     states.isSuccess = true;
        //     states.isLoading = false;
        //     states.data = normalized_data;
        //   }

        //   onSuccess && onSuccess(states.data);
        // });
      } else {
        if (delay) {
          delayTimeout = setTimeout(() => {
            states.isLoading = false;
            states.isError = false;
            states.isSuccess = true;

            if (result) states.data = result;

            onSuccess && onSuccess(states.data);
          }, delay);
        } else {
          states.isLoading = false;
          states.isError = false;
          states.isSuccess = true;

          if (result) states.data = result;

          onSuccess && onSuccess(states.data);
        }
      }
    }).catch((error: Error) => {
      states.isLoading = false;
      states.isError = true;
      states.isSuccess = false;

      onError && onError(error);
    });
  };

  onBeforeUnmount(() => {
    if (subscribed_result.value) subscribed_result.value.unsubscribe();
  });

  watch(
    query_key,
    () => {
      if (query_enabled.value) queryV2();
    },
    { deep: true },
  );

  if (query_enabled.value) {
    queryV2();
  }

  return {
    refetch: query,
    ...toRefs(states),
  };
};

export const useMutation = (params: MutateParams): MutateReturns => {
  const { mutateFn, onError, onSuccess } = params;
  const states = reactive({
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  const mutate = () => {
    states.isLoading = true;

    mutateFn().then((result: any) => {
      states.isLoading = false;
      states.isError = false;
      states.isSuccess = true;

      onSuccess && onSuccess(result);
    }).catch((error: Error) => {
      states.isLoading = false;
      states.isError = true;
      states.isSuccess = false;

      onError && onError(error);
    });
  };

  return {
    mutate,
    ...toRefs(states),
  };
};
