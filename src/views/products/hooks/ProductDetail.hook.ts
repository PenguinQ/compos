import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@database/hooks';
import {
  getProductDetail,
  queryProduct,
  mutateAddProduct,
  mutateEditProduct
} from '@database/query/product';
import { queryOneRx, mutateRx } from '@helpers/fetcher';
import { detailNormalizer } from '../normalizer/ProductDetail.normalizer';

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;
  const formData= reactive<any>({
    id: '',
    name: '',
    description: '',
    image: '',
    by: '',
    price: null,
    stock: null,
    variant: [],
    sku: '',
  });

  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => getProductDetail({
      id: params.id,
      normalizer: detailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: (error: any) => {
      console.error('Failed to get the product detail.', error);
    },
    onSuccess: (result: any) => {
      console.log('Success to get the product detail.', result);

      if (params.id) {
        formData.id = result.id;
        formData.name = result.name;
        formData.description = result.description;
        formData.image = result.image;
        formData.by = result.by;
        formData.price = result.price;
        formData.stock = result.stock;
        formData.sku = result.sku;
        // formData.variant = result.variant;

        result.variant?.forEach((variant: any) => {
          formData.variant.push({
            name: variant.name,
            price: variant.price,
            image: variant.image,
            stock: variant.stock,
          });
        });
      }
    },
  });

  const {
    mutate: mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    mutateFn: () => mutateEditProduct({
      id: params.id,
      data: {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        by: formData.by,
        price: parseInt(formData.price as any),
        stock: parseInt(formData.stock as any),
        variant: formData.variant,
        sku: formData.sku,
      },
    }),
    onError: (error: any) => {
      console.error('Error mutating product detail.', error);
    },
    onSuccess: () => {
      console.log('Success mutating product detail.');
    },
  });

  const resetForm = () => {
    formData.name = '';
    formData.description = '';
    formData.image = '';
    formData.by = '';
    formData.price = null;
    formData.stock = null;
    formData.variant = [];
    formData.sku = '';
  };

  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => mutateAddProduct({
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
