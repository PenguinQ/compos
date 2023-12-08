import { reactive, toRefs, watch } from 'vue';

export const useQuery = (params: any) => {
  if (!params) return false;

  const {
    disabled,
    queryFn,
    queryKey,
    onError,
    onSuccess,
  } = params;

  const states = reactive({
    data: {},
    isError: false,
    isLoading: false,
    isSuccess: false,
  });

  if (queryKey && queryKey.length) {
    watch(
      queryKey,
      () => {
        if (!disabled) {
          query();
        }
      },
    );
  }

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

          onSuccess && onSuccess(data);
        });
      } else {
        states.isLoading = false;
        states.isError = false;
        states.isSuccess = true;

        if (result) states.data = result;

        onSuccess && onSuccess(result);
      }

    }).catch((error: Error) => {
      states.isLoading = false;
      states.isError = true;
      states.isSuccess = false;

      onError && onError(error);
    });
  };

  if (!disabled) query();

  return {
    refetch: query,
    ...toRefs(states)
  };
};

export const useMutation = (params: any) => {
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
