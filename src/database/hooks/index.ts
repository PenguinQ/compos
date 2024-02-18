import {
  ref,
  reactive,
  isRef,
  toRefs,
  watch,
  onBeforeUnmount,
} from 'vue';
import type { Ref } from 'vue';

type QueryParams = {
  enabled?: boolean;
  queryKey?: Ref<string>[],
  queryFn: () => Promise<void>;
  onError?: (response: Error) => void;
  onSuccess?: (response: object) => void;
}

type QueryReturns = {
  data: Ref<any>;
  isError: Ref<boolean>;
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
  refetch: () => void;
};

type MutateParams = {
  mutateFn: () => Promise<void>;
  onError?: (response: Error) => void;
  onSuccess?: (response: object) => void;
}

export const useQuery = (params: QueryParams): QueryReturns => {
  if (!params) return false as any;

  const {
    enabled = true,
    queryKey = [],
    queryFn,
    onError,
    onSuccess,
  } = params;
  const query_enabled = isRef(enabled) ? enabled : ref(enabled);
  const query_key = isRef(queryKey) ? queryKey : ref(queryKey);
  const states = reactive({
    data: {},
    isError: false,
    isLoading: false,
    isSuccess: false,
  });
  const subscribed_result = ref<any>(null);

  const query = () => {
    states.isLoading = true;

    queryFn().then((response: any) => {
      const { observe, result } = response;

      if (observe) {
        const { normalizer, preprocessor } = response;

        subscribed_result.value = result.subscribe(async (data: any) => {
          if (data) {
            const processed_data = preprocessor ? await preprocessor(data) : data;
            const normalized_data  = normalizer ? normalizer(processed_data) : processed_data;

            states.isError = false;
            states.isSuccess = true;
            states.isLoading = false;
            states.data = normalized_data;
          }

          onSuccess && onSuccess(states.data);
        });
      } else {
        states.isLoading = false;
        states.isError = false;
        states.isSuccess = true;

        if (result) states.data = result;

        onSuccess && onSuccess(states.data);
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
      if (query_enabled.value) query();
    },
    { deep: true },
  );

  if (query_enabled.value) query();

  return {
    refetch: query,
    ...toRefs(states)
  };
};

export const useMutation = (params: MutateParams) => {
  if (!params) return false;

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
