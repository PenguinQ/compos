import { computed, ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@database/hooks';
import { queryRx, queryOneRx, mutateRx } from '@helpers/fetcher';

export const useBundleDetail = () => {
  const route = useRoute();
  const { params } = route;
  const bundleAvailable = ref(true);
  const runProductQuery = ref(false);
  const enabled = computed(() => runProductQuery.value);
  const productIDs = ref([]);
  const formData = reactive({
    id: '',
    name: '',
    description: '',
    image: '',
    by: '',
    price: null,
    stock: null,
    sku: '',
  });

  const testData = ref(null);

  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    which: 'bundle detail',
    queryFn: () => queryOneRx({
      subscribe: true,
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
      console.error('Failed to get the bundle detail.', error);
    },
    onSuccess: async (result: any) => {
      console.log('Success to get the bundle detail.', result);

      // testData.value = await result.populate('product_id');

      // testData.value = product;

      // console.log(product);

      // DON'T REMOVE!
      //
      // if (result) {
      //   const splittedID = result.product_id.split(',');

      //   // Don't change the order, since the the product detail query listen to the productIDs values.
      //   runProductQuery.value = true;
      //   productIDs.value = splittedID;
      // }

      // formData.id = result.id;
      // formData.name = result.name;
      // formData.description = result.description;
      // formData.image = result.image;
      // formData.by = result.by;
      // formData.price = result.price;
      // formData.stock = result.stock;
      // formData.sku = result.sku;
    },
  });

  // DON'T REMOVE!
  // const {
  //   data: productData,
  //   refetch: productRefetch,
  //   isError: productError,
  //   isLoading: productLoading,
  //   isSuccess: productSuccess,
  // } = useQuery({
  //   queryKey: [productIDs],
  //   queryFn: () => queryRx({
  //     collection: 'product',
  //     query: {
  //       selector: {
  //         id: {
  //           $in: productIDs.value,
  //         },
  //       },
  //     },
  //   }),
  //   enabled,
  //   onError: (error: any) => {
  //     console.error('Failed to get the product detail.', error);
  //   },
  //   onSuccess: (result: any) => {
  //     console.log('Success to get the bundle product detail.', result);

  //     const filtered = result.filter((res: any) => res.stock === 0);

  //     if (filtered.length) {
  //       bundleAvailable.value = false;
  //     }
  //   },
  // });

  const mutateQuery = params.id ? {
    selector: {
      id: {
        $eq: params.id,
      },
    },
  } : undefined;

  const {
    mutate: mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    mutateFn: () => mutateRx({
      collection: 'bundle',
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
      console.error('Error mutating bundle detail.', error);
    },
    onSuccess: () => {
      console.log('Success mutating bundle detail.');
    },
  });

  const resetForm = () => {
    formData.name = '';
    formData.description = '';
    formData.image = '';
    formData.by = '';
    formData.price = null;
    formData.stock = null;
    formData.sku = '';
  };

  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => mutateRx({
      collection: 'bundle',
      method: 'post',
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
      console.error('Error adding new bundle.', error);
    },
    onSuccess: () => {
      console.log('Success adding new bundle.');
      resetForm();
    },
  });

  return {
    bundleAvailable,
    bundleID: params.id,
    data,
    testData,
    // productData,
    // productLoading,
    // productError,
    // productSuccess,
    formData,
    isError,
    isLoading,
    isSuccess,
    refetch,
    mutateAddLoading,
    mutateAdd,
    mutateEditLoading,
    mutateEdit,
  };
};
