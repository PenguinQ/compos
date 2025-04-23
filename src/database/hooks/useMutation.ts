import { reactive, toRefs } from 'vue';
import type { UnwrapRef } from 'vue';

type MutateFnVariable = {
  [key: string]: any;
};

type UseMutationParams<TVariables = MutateFnVariable, TData = unknown> = {
  mutateFn: (variables?: TVariables) => Promise<TData>;
  onError?: (response: Error, variables?: TVariables) => void;
  onSuccess?: (response?: TData, variables?: TVariables) => void;
};

export default <TVariables = MutateFnVariable, TData = unknown>(params: UseMutationParams<TVariables, TData>) => {
  const { mutateFn, onError, onSuccess } = params;
  const states = reactive({
    data     : undefined as undefined | TData,
    isError  : false,
    isLoading: false,
    isSuccess: false,
  });

  const mutate = async (variables?: TVariables): Promise<void> => {
    states.isLoading = true;

    try {
      const result = await mutateFn(variables);

      states.isLoading = false;
      states.isError   = false;
      states.isSuccess = true;
      states.data      = result as unknown as UnwrapRef<TData>;

      if (onSuccess) onSuccess(result, variables);
    } catch (error) {
      states.isLoading = false;
      states.isSuccess = false;
      states.isError   = true;
      states.data      = undefined;

      if (onError) onError(error as Error, variables);
    }
  };

  return {
    mutate,
    ...toRefs(states),
  };
};