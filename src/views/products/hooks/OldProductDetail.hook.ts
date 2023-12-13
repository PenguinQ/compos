import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@database/hooks';
import { queryProduct, mutateProduct } from '@database/query/product';
import { queryOneRx, mutateRx } from '@helpers/fetcher';

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;
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

  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => queryOneRx({
      collection: 'product',
      // subscribe: true,
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
      console.error('Failed to get the product detail.', error);
    },
    onSuccess: (result: any) => {
      // console.log('Success to get the product detail.', result);

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
    mutate: mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    // mutateFn: () => mutateRx({
    mutateFn: () => mutateProduct({
      collection: 'product',
      method: 'put',
      params: params.id,
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
      console.error('Error mutating product detail.', error);
    },
    onSuccess: () => {
      // console.log('Success mutating product detail.');
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
      collection: 'product',
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
      console.error('Error adding new product.', error);
    },
    onSuccess: () => {
      console.log('Success adding new product.');
      resetForm();
    },
  });

  return {
    productID: params.id,
    data,
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
