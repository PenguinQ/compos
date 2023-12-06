import { reactive, toRef, toRefs, watch } from 'vue';

export const useQuery = (params: any) => {
  if (!params) return false;

  const { queryFn, queryKey, disabled, onError, onSuccess } = params;

  const states = reactive({
    data: null,
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

    queryFn().then((result: any) => {
      states.isLoading = false;
      states.isSuccess = true;
      states.data = result;
      onSuccess && onSuccess(result);
    }).catch((error: Error) => {
      states.isLoading = false;
      states.isError = true;
      states.isSuccess = false;
      onError && onError(error);
    });
  }

  if (!disabled) {
    query();
  }

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
    isLoading: true,
    isSuccess: false,
  });

  const mutate = () => {
    mutateFn().then((result: any) => {
      states.isLoading = false;
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
