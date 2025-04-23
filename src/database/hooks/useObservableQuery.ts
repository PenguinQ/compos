import { computed, ref, reactive, toRefs, watch, onBeforeUnmount, isRef } from 'vue';
import type { Observable, Subscription } from 'rxjs';

// Databases
import type { UseQueryParams } from './useQuery';

type ObservableQueryFn<TData, TResult> = {
  observable: true;
  observableQuery: Observable<TData>;
  observableQueryFn: (data: TData) => Promise<TResult>;
};

interface UseObserveableQuery<TData, TResult, TNormalized = TResult> extends Omit<UseQueryParams<TNormalized>, 'cache' | 'queryFn' | 'queryNormalizer'> {
  queryFn: () => Promise<ObservableQueryFn<TData, TResult>>;
  queryNormalizer?: (data: TResult) => TNormalized;
}

export default <TData, TResult, TNormalized = TResult>({
  enabled = true,
  delay,
  queryFn,
  queryNormalizer,
  onError,
  onSuccess,
}: UseObserveableQuery<TData, TResult, TNormalized>) => {
  const queryData   = ref<TNormalized>();
  const queryStates = reactive({
    isError  : false,
    isLoading: false,
    isSuccess: false,
  });
  const queryEnabled     = computed(() => isRef(enabled) ? enabled.value : enabled);
  const subscribedResult = ref<Subscription>();
  let delayTimeout: ReturnType<typeof setTimeout>;

  const query = async (): Promise<void> => {
    try {
      queryStates.isLoading = true;

      if (delay) clearTimeout(delayTimeout);

      const { observable, observableQuery, observableQueryFn } = await queryFn();

      if (!observable) throw Error('Observable query must have observable as true');

      subscribedResult.value?.unsubscribe();
      subscribedResult.value = observableQuery.subscribe({
        next: async (data) => {
          const observedData   = await observableQueryFn(data);
          const normalizedData = queryNormalizer ? queryNormalizer(observedData) : observedData as TNormalized;

          if (delay) {
            queryStates.isLoading = true;

            delayTimeout = setTimeout(() => {
              queryStates.isError   = false;
              queryStates.isSuccess = true;
              queryStates.isLoading = false;
              queryData.value       = normalizedData;

              onSuccess && onSuccess(queryData.value);
            }, delay);
          } else {
            queryStates.isError   = false;
            queryStates.isSuccess = true;
            queryStates.isLoading = false;
            queryData.value       = normalizedData;

            onSuccess && onSuccess(queryData.value);
          }
        },
      });
    } catch (error) {
      queryStates.isError   = true;
      queryStates.isLoading = false;
      queryStates.isSuccess = false;

      if (onError) onError(error as Error);
    }
  };

  const unsubscribe = () => subscribedResult.value?.unsubscribe();

  // Unsubscribe when unmount if the query is an observeable query.
  onBeforeUnmount(() => {
    if (subscribedResult.value) subscribedResult.value.unsubscribe();
  });

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
    unsubscribe,
    ...toRefs(queryStates),
  };
};
