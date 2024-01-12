import {
  ref,
  reactive,
  isRef,
  toRefs,
  watch,
} from 'vue';

export const useQuery = (params: any): any => {
  if (!params) return false;

  const {
    enabled = true,
    queryKey = [],
    queryFn,
    onError,
    onSuccess,
  } = params;
  const enableQuery = isRef(enabled) ? enabled : ref(enabled);
  const keyQuery = isRef(queryKey) ? queryKey : ref(queryKey);
  const states = reactive({
    data: {},
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  const query = () => {
    states.isLoading = true;

    queryFn().then((response: any) => {
      const { subscribe, result } = response;

      if (subscribe) {
        result.subscribe((data: any) => {
          states.isLoading = false;
          states.isError = false;
          states.isSuccess = true;

          if (data) states.data = data;

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

  watch(
    keyQuery,
    () => {
      if (enableQuery.value) query();
    },
    { deep: true },
  );

  if (enableQuery.value) query();

  return {
    refetch: query,
    ...toRefs(states)
  };
};

export const useMutation = (params: any): any => {
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
