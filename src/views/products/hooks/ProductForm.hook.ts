import { ref, reactive, toRaw } from 'vue';
import { useRoute } from 'vue-router';

import { useQuery, useMutation } from '@database/hooks';
import { getProductDetail, mutateAddProduct, mutateEditProduct } from '@database/query/product';
import { formDetailNormalizer } from '../normalizer/ProductForm.normalizer';

export const useProductForm = () => {
  const route = useRoute();
  const { params } = route;
  const formData = reactive<any>({
    id             : '',
    name           : '',
    description    : '',
    image          : [],
    by             : '',
    price          : 0,
    stock          : 0,
    variant        : [],
    sku            : '',
    deleted_image  : [],
    deleted_variant: [],
    new_image      : {
      data   : [],
      preview: [],
    },
  });

  // Get product detail hooks.
  const {
    data,
    refetch,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    queryFn: () => getProductDetail({
      id: params.id,
      normalizer: formDetailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: (error: string) => {
      console.error('Failed to get the product detail.', error);
    },
    onSuccess: (result: any) => {
      console.info('Success to get the product detail.');

      if (params.id) {
        formData.id          = result.id;
        formData.name        = result.name;
        formData.description = result.description;
        formData.image       = result.image;
        formData.by          = result.by;
        formData.price       = result.price;
        formData.stock       = result.stock;
        formData.sku         = result.sku;

        result.variant?.forEach((v: any) => {
          formData.variant.push({
            id           : v.id,
            product_id   : v.product_id,
            name         : v.name,
            image        : v.image,
            price        : v.price,
            stock        : v.stock,
            new_image    : { data: [], preview: [] },
            deleted_image: []
          });
        });
      }
    },
  });

  // Edit product detail hooks.
  const {
    mutate: mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    mutateFn: () => {
      const variantData = formData.variant.map((v: any) => {
        const { new_image, ...rest } = v;

        return {
          new_image: toRaw(new_image.data),
          ...rest,
        };
      })

      return mutateEditProduct({
        id: params.id,
        data: {
          name           : formData.name,
          description    : formData.description,
          by             : formData.by,
          price          : parseInt(formData.price as any),
          stock          : parseInt(formData.stock as any),
          variant        : variantData,
          sku            : formData.sku,
          new_image      : toRaw(formData.new_image.data),
          deleted_image  : formData.deleted_image,
          deleted_variant: formData.deleted_variant,
        },
      });
    },
    onError: (error: string) => {
      console.error('Error mutating product detail.', error);
    },
    onSuccess: () => {
      console.log('Success mutating product detail.');
    },
  });

  // Add new product hooks.
  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const variantData = formData.variant.map((v: any) => {
        const { new_image, ...rest } = v;

        return {
          new_image: toRaw(new_image.data),
          ...rest,
        };
      });

      return mutateAddProduct({
        data: {
          name       : formData.name,
          description: formData.description,
          new_image  : toRaw(formData.new_image.data),
          by         : formData.by,
          variant    : variantData,
          price      : parseInt(formData.price as any),
          stock      : parseInt(formData.stock as any),
          sku        : formData.sku,
        },
      });
    },
    onError: (error: string) => {
      console.error('Error adding new product.', error);
    },
    onSuccess: () => {
      console.log('Success adding new product.');
      handleResetForm();
    },
  });

  const handleResetForm = () => {
    formData.name        = '';
    formData.description = '';
    formData.image       = [];
    formData.by          = '';
    formData.price       = 0;
    formData.stock       = 0;
    formData.variant     = [];
    formData.sku         = '';
    formData.new_image   = { data: [], preview: [] };
  };

  const handleAddImage = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;

    [...files].forEach((file: File) => {
      const reader = new FileReader();

      reader.onload = () => {
        formData.new_image.data.push(file);
        formData.new_image.preview.push(reader.result);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleAddVariantImage = (e: Event, index: number) => {
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;

    [...files].forEach(async (file: File) => {
      const reader = new FileReader();

      reader.onload = () => {
        formData.variant[index].new_image.data.push(file);
        formData.variant[index].new_image.preview.push(reader.result);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleAddVariant = async () => {
    formData.variant.push({
      name         : '',
      price        : 0,
      stock        : 0,
      new_image    : { data: [], preview: [] },
      deleted_image: [],
    });
  };

  const handleRemoveVariant = (index: number, id: string) => {
    id && formData.deleted_variant.push(id);
    formData.variant.splice(index, 1);
  };

  const handleRemoveImage = (index: number, id?: string) => {
    if (id) {
      formData.deleted_image.push(id);
      formData.image.splice(index, 1);
    } else {
      formData.new_image.data.splice(index, 1);
      formData.new_image.preview.splice(index, 1);
    }
  };

  const handleRemoveVariantImage = (index: number, imageIndex: number, id?: string) => {
    if (id) {
      formData.variant[index].deleted_image.push(id);
      formData.variant[index].image.splice(imageIndex, 1);
    } else {
      formData.variant[index].new_image.data.splice(imageIndex, 1);
      formData.variant[index].new_image.preview.splice(imageIndex, 1);
    }
  };

  return {
    productID: params.id,
    data,
    formData,
    isError,
    isLoading,
    isSuccess,
    handleAddImage,
    handleRemoveImage,
    handleAddVariant,
    handleAddVariantImage,
    handleRemoveVariant,
    handleRemoveVariantImage,
    refetch,
    mutateAddLoading,
    mutateAdd,
    mutateEditLoading,
    mutateEdit,
  };
};
