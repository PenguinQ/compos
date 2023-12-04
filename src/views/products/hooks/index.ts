import { reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useQueryTest, useMutationTest, useQuery, useQueryOne, useMutation } from '@database/hooks';
import { queryRx, queryOneRx, mutateOneRx } from '@helpers/fetcher';

export const useTest = () => {
  const {
    data,
    isError,
    isLoading,
    isSuccess,
  } = useQueryTest({
    queryFn: () => queryRx({ collection: 'product' }),
    onError: (error: any) => {
      console.log('Error', error);
    },
    onSuccess: (result: any) => {
      console.log('Success', result)
    },
  });

  return {
    data,
    isError,
    isLoading,
    isSuccess
  };
};

export const useTestDetail = () => {
  const route = useRoute();
  const { params } = route;
  const formData = reactive({
    id: params.id,
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
  } = useQueryTest({
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

  const {
    mutate: mutateProduct,
  } = useMutationTest({
    mutateFn: () => mutateOneRx({
      collection: 'product',
      query: {
        selector: {
          id: {
            $eq: params.id,
          },
        },
      },
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

  return {
    data,
    formData,
    isError,
    isLoading,
    isSuccess,
    mutateProduct,
  };
};

export const useProducts = () => {
  const {
    data,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    collection: 'product',
    onError: (error: string) => {
      console.log('Error', error);
    },
    onSuccess: () => {
      console.log('Success');
    },
  });

  return {
    data,
    isError,
    isLoading,
    isSuccess
  };
};

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;
  const formData = reactive({
    id: params.id,
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
  } = useQueryOne({
    collection: 'product',
    query: {
      selector: {
        id: {
          $eq: params.id,
        },
      },
    },
    onError: (error: string) => {
      console.log('Error', error);
    },
    onSuccess: (result: any) => {
      console.log('Success');

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

  const {
    mutate: mutateProduct,
    isLoading: mutateLoading,
    isError: mutateError,
    isSuccess: mutateSuccess,
  } = useMutation({
    collection: 'product',
    query: {
      selector: {
        id: {
          $eq: formData.id,
        },
      },
    },
    data: {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      by: formData.by,
      price: parseInt(formData.price as any),
      stock: parseInt(formData.stock as any),
      sku: formData.sku,
    },
    onError: (error: string) => {
      console.log('Mutate error', error);
    },
    onSuccess: (result: any) => {
      console.log('Mutate success');
    },
  })

  const getFormData = () => {
    console.log(formData);

    // export const updateProduct = async (id: string, data: ProductData) => {
    //   await db.product.findOne(id).exec().then((prod: any) => {
    //     prod.update({
    //       $set: {
    //         name: data.name,
    //         description: data.description,
    //         image: data.image,
    //         by: data.by,
    //         price: parseInt(data.price as string),
    //         stock: data.stock,
    //         sku: data.sku,
    //       },
    //     });
    //   });
    // };
  };

  return {
    data,
    formData,
    isError,
    isLoading,
    isSuccess,
    mutateProduct,
    getFormData,
  };
};
