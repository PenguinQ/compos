import { ref, reactive, Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery, useMutation } from '@database/hooks';
import {
  getProductDetail,
  queryProduct,
  mutateAddProduct,
  mutateEditProduct
} from '@database/query/product';
import { detailNormalizer } from '../normalizer/ProductDetail.normalizer';

export const useProductDetail = () => {
  const route = useRoute();
  const { params } = route;
  const formData = reactive<any>({
    id: '',
    name: '',
    description: '',
    image: null,
    image_preview: '',
    by: '',
    price: 0,
    stock: 0,
    variant: [],
    sku: '',
  });
  const removeVariantID: string[] = [];

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
    onError: (error: string) => {
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

        result.variant?.forEach((variant: any) => {
          formData.variant.push({
            id: variant.id,
            product_id: variant.product_id,
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
        removeVariantID,
      },
    }),
    onError: (error: string) => {
      console.error('Error mutating product detail.', error);
    },
    onSuccess: () => {
      console.log('Success mutating product detail.');
    },
  });

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
        variant: formData.variant,
        price: parseInt(formData.price as any),
        stock: parseInt(formData.stock as any),
        sku: formData.sku,
      },
    }),
    onError: (error: string) => {
      console.error('Error adding new product.', error);
    },
    onSuccess: () => {
      console.log('Success adding new product.');
      handleResetForm();
    },
  });

  const handleResetForm = () => {
    formData.name = '';
    formData.description = '';
    formData.image = null;
    formData.by = '';
    formData.price = 0;
    formData.stock = 0;
    formData.variant = [];
    formData.sku = '';
  };

  const handleAddImage = (e: Event) => {
    /**
     * Single file handling
     */
    formData.image = [];
    formData.image_preview = '';

    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    const reader = new FileReader();

    reader.onload = () => {
      formData.image = file;
      formData.image_preview = reader.result;
    };

    reader.readAsDataURL(file);

    /**
     * Multiple file handling (for future references)
     */
    // imagePreview.value = [];
    // formData.image = [];

    // const target = e.target as HTMLInputElement;
    // const files = target.files as FileList;

    // [...files].forEach((file: File) => {
    //   const reader = new FileReader();

    //   reader.onload = () => {
    //     formData.image.push(file);
    //     imagePreview.value.push(reader.result);
    //   };

    //   reader.readAsDataURL(file);
    // });
  };

  const handleAddVariantImage = (e: Event, index: number) => {
    formData.variant[index].image = [];
    formData.variant[index].image_preview = '';

    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    const reader = new FileReader();

    reader.onload = () => {
      formData.variant[index].image = file;
      formData.variant[index].image_preview = reader.result;
    }

    reader.readAsDataURL(file);
  };

  const handleAddVariant = () => {
    formData.variant.push({
      name: '',
      image: [],
      image_preview: '',
      price: 0,
      stock: 0,
    });
  };

  const handleRemoveVariant = (index: number, id: string) => {
    if (id) removeVariantID.push(id);
    formData.variant.splice(index, 1);
  };

  return {
    removeVariantID,
    // Add Related
    productID: params.id,
    data,
    formData,
    isError,
    isLoading,
    isSuccess,
    handleAddImage,
    handleAddVariant,
    handleAddVariantImage,
    handleRemoveVariant,
    refetch,
    mutateAddLoading,
    mutateAdd,
    mutateEditLoading,
    mutateEdit,
  };
};
