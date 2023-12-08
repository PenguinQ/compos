import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@database/hooks';
import { queryRx, queryOneRx, mutateOneRx } from '@helpers/fetcher';

/**
 * -------------------------
 * Mango Selector References
 * -------------------------
 * $lt  = less than
 * $lte = less than and equal
 * $ne  = not equal
 * $gt  = greater than
 * $gte = greater than and equal
 */
export const useProduct = () => {
  const page = ref(1);
  const limit = ref(5);
  const selector = ref<any>({
    id: {
      $gte: ''
    },
  });
  const paginationData = ref([]);
  const stopQuery = ref(false);
  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [page, limit],
    queryFn: () => queryRx({
      collection: 'product',
      query: {
        selector: selector.value,
        sort: [
          { id: 'desc' },
        ],
        limit: limit.value,
      },
    }),
    onError: (error: any) => {
      console.log('Error', error);
    },
    onSuccess: (result: any) => {
      console.log('Success', result)

      if (result.length) {
        const id = result[result.length - 1]._data.id;

        selector.value = {
          /**
           * READ THIS!
           *
           * "created_at $ne = ''" are used to force return any results from query since somehow
           * when using ULID as unique identifier and sorting descending "id" doesn't return
           * any next expected data for pagination.
           *
           * Check for this in the future.
           */
          created_at: {
            $ne: '',
          },
          id: {
            $lt: id,
          },
        };

        paginationData.value.push(...result);
      } else {
        stopQuery.value = true;
      }
    },
  });

  const nextPage = () => {
    if (!stopQuery.value) {
      // page.value = page.value + 1;
      refetch();
    }
  };

  const removeID = ref<string | null>(null);

  const {
    mutate: mutateRemove,
    isLoading: mutateRemoveLoading,
  } = useMutation({
    mutateFn: () => mutateOneRx({
      method: 'delete',
      collection: 'product',
      query: {
        selector: {
          id: {
            $eq: removeID.value,
          },
        },
      },
    }),
    onError: (error: any) => {
      console.log('Error mutate', error);
    },
    onSuccess: () => {
      console.log('Success mutate');
      refetch();
    },
  });

  return {
    removeID,
    data,
    paginationData,
    page,
    isError,
    isLoading,
    isSuccess,
    mutateRemoveLoading,
    nextPage,
    mutateRemove,
  };
};

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;
  const formData = reactive({
    id: '',
    name: '',
    description: '',
    image: '',
    by: '',
    price: undefined,
    stock: undefined,
    sku: '',
  });

  const {
    data,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => queryOneRx({
      collection: 'product',
      query: {
        selector: {
          id: {
            $eq: params.id,
          },
        },
      },
    }),
    disabled: params.id ? false : true,
    onError: (error: any) => {
      console.log('Error', error);
    },
    onSuccess: (result: any) => {
      console.log('Success', result);
      formData.id = result.id;
      formData.name = result.name;
      formData.description = result.description;
      formData.image = result.image;
      formData.by = result.by;
      formData.price = result.price;
      formData.stock = result.stock;
      formData.sku = result.sku;
    },
  });

  const mutateQuery = params.id ? {
    selector: {
      id: {
        $eq: params.id,
      },
    },
  } : undefined;

  const {
    mutate: mutateProduct,
    isLoading: mutateProductLoading,
  } = useMutation({
    mutateFn: () => mutateOneRx({
      collection: 'product',
      method: 'put',
      query: mutateQuery,
      data: {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        by: formData.by,
        price: parseInt(formData.price as any),
        stock: parseInt(formData.stock as any),
        sku: formData.sku,
      },
    }),
    onError: (error: any) => {
      console.log('Error mutate', error);
    },
    onSuccess: () => {
      console.log('Success mutate');
    },
  });

  // export const addProduct = async (data: ProductData) => {
  //   await db.product.insert({
  //     id: data.id,
  //     name: data.name,
  //     description: data.description,
  //     image: data.image,
  //     by: data.by,
  //     price: parseInt(data.price as string),
  //     stock: data.stock,
  //     sku: data.sku,
  //     timestamp: new Date().toISOString(),
  //   });
  // };

  return {
    data,
    formData,
    isError,
    isLoading,
    isSuccess,
    mutateProduct,
    mutateProductLoading,
  };
};

export const useBundle = () => {
  const page = ref(1);
  const limit = ref(5);
  const selector = ref<any>({
    id: {
      $gte: ''
    },
  });
  const paginationData = ref([]);
  const stopQuery = ref(false);
  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [page, limit],
    queryFn: () => queryRx({
      collection: 'bundle',
      query: {
        selector: selector.value,
        sort: [
          { id: 'desc' },
        ],
        limit: limit.value,
      },
    }),
    onError: (error: any) => {
      console.log('Error', error);
    },
    onSuccess: (result: any) => {
      if (result.length) {
        const id = result[result.length - 1]._data.id;

        selector.value = {
          /**
           * READ THIS!
           *
           * "created_at $ne = ''" are used to force return any results from query since somehow
           * when using ULID as unique identifier and sorting descending "id" doesn't return
           * any next expected data for pagination.
           *
           * Check for this in the future.
           */
          created_at: {
            $ne: '',
          },
          id: {
            $lt: id,
          },
        };

        paginationData.value.push(...result);
      } else {
        stopQuery.value = true;
      }
    },
  });

  const nextPage = () => {
    if (!stopQuery.value) {
      // page.value = page.value + 1;
      refetch();
    }
  };

  return {
    data,
    paginationData,
    page,
    isError,
    isLoading,
    isSuccess,
    nextPage,
  };
};

export const useBundleDetail = () => {
  const route = useRoute();
  const { params } = route;

  const {
    data,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => queryOneRx({
      collection: 'bundle',
      query: {
        selector: {
          id: {
            $eq: params.id,
          },
        },
      },
    }),
    disabled: params.id ? false : true,
    onError: (error: any) => {
      console.log('Error', error);
    },
    onSuccess: (result: any) => {
      console.log('Success', result);
    },
  });

  return {
    data,
    isError,
    isLoading,
    isSuccess,
  };
};
