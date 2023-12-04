import { reactive, toRefs } from 'vue';
import { queryRx, queryOneRx, mutateOneRx } from '@helpers/fetcher';

// Equals to useQuery in vue-query
export const useQueryTest = (params: any) => {
  if (!params) return false;

  const { queryFn, onError, onSuccess } = params;
  const states = reactive({
    data: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

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

  return toRefs(states);
};

export const useMutationTest = (params: any) => {
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
  };
};

export const useQuery = (params: any) => {
  if (!params) return false;

  const {
    collection,
    query,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

  const queryResult = queryRx({ collection, query });

  queryResult.then((result: any) => {
    states.isLoading = false;
    states.isSuccess = true;
    states.data = result;

    onSuccess && onSuccess(states.data);
  }).catch((error: Error) => {
    states.isLoading = false;
    states.isError = true;
    states.isSuccess = false;

    onError && onError(error);
  });

  return toRefs(states);
};

export const useQueryOne = (params: any) => {
  if (!params) return false;

  const {
    collection,
    query,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

  const queryResult = queryOneRx({ collection, query });

  queryResult.then((result: any) => {
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

  return toRefs(states);
};

export const useMutation = (params: any) => {
  const {
    collection,
    query,
    data,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

  // const queryResult = queryOneRx({ collection, query });
  // const queryResult = mutateOneRx({ collection, query, data });

  const mutate = () => {
    console.log(data);
    // console.log(query);
    // console.log(data)
    // const queryResult = mutateOneRx({ collection, query, data });

    // queryResult.then((result: any) => {
    //   states.isLoading = false;
    //   states.isSuccess = true;

    //   onSuccess && onSuccess(result);
    // }).catch((error: Error) => {
    //   states.isLoading = false;
    //   states.isError = true;
    //   states.isSuccess = false;

    //   onError && onError(error);
    // });
  };

  return {
    mutate,
    ...toRefs(states)
  }
};
