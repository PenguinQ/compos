import { reactive, toRaw, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useQuery, useMutation } from '@/database/hooks';
import {
  getProductDetail,
  mutateAddProduct,
  mutateEditProduct,
} from '@/database/query/product'
import { formDetailNormalizer } from '../normalizer/ProductForm.normalizer';

type Image = {
  id?: string;
  data?: File;
  path: string | ArrayBuffer | null;
};

type FormDataVariant = {
  id?: string;
  product_id?: string;
  name: string;
  price: number;
  stock: number;
  image: Image[];
  new_image: Image[];
  deleted_image: string[];
};

type FormData = {
  id: string;
  name: string;
  description: string;
  by: string;
  price: number;
  stock: number;
  sku: string;
  variant: FormDataVariant[];
  deleted_variant: string[];
  image: Image[];
  deleted_image: string[];
  new_image: Image[];
};

type FormErrorVariant = {
  name: string;
  price: string;
  stock: string;
};

type FormError = {
  name: string;
  price: string;
  stock: string;
  variant: FormErrorVariant[];
};

export const useProductForm = () => {
  const route = useRoute();
  const router = useRouter();
  const toast = inject('ToastProvider');
  const { params } = route;
  const formData = reactive<FormData>({
    id             : '',
    name           : '',
    description    : '',
    by             : '',
    price          : 0,
    stock          : 0,
    sku            : '',
    variant        : [],
    deleted_variant: [],
    image          : [],
    deleted_image  : [],
    new_image      : [],
  });

  const form_error = reactive<FormError>({
    name: '',
    price: '',
    stock: '',
    variant: [],
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
      id: params.id as string,
      normalizer: formDetailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: (error: Error) => {
      console.error('Failed to get the product detail.', error);
      toast.add({ message: 'Failed to get the product detail.', type: 'error' });
    },
    onSuccess: (result: any) => {
      console.info('[SUCCESS] Product Form Page.');

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
            new_image    : [],
            deleted_image: []
          });
          form_error.variant.push({
            name: '',
            price: '',
            stock: '',
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
      const product_image = formData.new_image.length ? formData.new_image.map(image => image.data) : [];
      const variant_data = formData.variant.map(variant => {
        const { new_image, ...rest } = variant;
        const variant_image = new_image.map(image => image.data);

        return {
          new_image: new_image.length ? variant_image : [],
          ...rest,
        };
      });

      return mutateEditProduct({
        id: params.id as string,
        data: {
          name           : formData.name,
          description    : formData.description,
          by             : formData.by,
          price          : formData.price,
          stock          : formData.stock,
          sku            : formData.sku,
          variant        : variant_data,
          deleted_variant: formData.deleted_variant,
          new_image      : product_image as File[],
          deleted_image  : formData.deleted_image,
        },
      });
    },
    onError: (error: Error) => {
      console.error('Error mutating product detail.', error);
      toast.add({ message: 'Error updating product detail.', type: 'error' });
    },
    onSuccess: () => {
      toast.add({ message: 'Product detail updated.', type: 'success', duration: 2000 });
      // router.back();
    },
  });

  // Add new product hooks.
  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const product_image = formData.new_image.length ? formData.new_image.map(image => image.data) : [];
      const variant_data = formData.variant.map(variant => {
        const { new_image, ...rest } = variant;
        const variant_image = new_image.map(image => image.data);

        return {
          new_image: new_image.length ? variant_image : [],
          ...rest,
        };
      });

      return mutateAddProduct({
        data: {
          name       : formData.name,
          description: formData.description,
          by         : formData.by,
          price      : parseInt(formData.price as string),
          stock      : parseInt(formData.stock as string),
          sku        : formData.sku,
          variant    : variant_data,
          new_image  : product_image as File[],
        },
      });
    },
    onError: (error: Error) => {
      console.error('Error adding new product.', error);
      toast.add({ message: 'Error adding new product.', type: 'error' });
    },
    onSuccess: () => {
      console.log('Success adding new product.');
      handleResetForm();
      toast.add({ message: 'Product added.', type: 'success', duration: 2000 });
      // router.back();
    },
  });

  const handleResetForm = () => {
    // Reset form.
    formData.name        = '';
    formData.description = '';
    formData.image       = [];
    formData.by          = '';
    formData.price       = 0;
    formData.stock       = 0;
    formData.variant     = [];
    formData.sku         = '';
    formData.new_image   = [];

    // Reset errors.
    form_error.name = '';
    form_error.price = '';
    form_error.stock = '';
    form_error.variant = [];
  };

  const isImageValid = (files: File[]) => {
    const allowed_file_types = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    return files.reduce((acc, file) => {
      return acc && allowed_file_types.includes(file.type);
    }, true);
  };

  const handleAddImage = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;

    // if (isImageValid([...files])) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (formData.new_image.length) {
          formData.new_image[0].data = file;
          formData.new_image[0].path = reader.result;
        } else {
          formData.new_image.push({ data: file, path: reader.result });
        }
      }

      reader.readAsDataURL(file);
    // } else {
    //   toast.add({ message: 'Invalid file type, please use image file only.', type: 'error' });
    // }
  };

  const handleAddVariantImage = (e: Event, index: number) => {
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;

    [...files].forEach(async (file: File) => {
      const reader = new FileReader();

      reader.onload = () => {
        // Replace first image data and preview with new one.
        if (formData.variant[index].new_image.length) {
          formData.variant[index].new_image[0].data = file;
          formData.variant[index].new_image[0].path = reader.result;
        } else {
          formData.variant[index].new_image.push({ data: file, path: reader.result });
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleAddVariant = async () => {
    formData.variant.push({
      name: '',
      price: 0,
      stock: 0,
      image: [],
      new_image: [],
      deleted_image: [],
    });

    form_error.variant.push({
      name: '',
      price: '',
      stock: ''
    })
  };

  const handleRemoveVariant = (index: number, id?: string) => {
    id && formData.deleted_variant.push(id);
    formData.variant.splice(index, 1);
  };

  const handleRemoveImage = () => {
    if (formData.image.length) {
      if (formData.new_image.length) {
        formData.new_image.splice(0, 1);
      } else {
        formData.deleted_image.push(formData.image[0].id as string);
        formData.image.splice(0, 1);
      }
    } else {
      formData.new_image.splice(0, 1);
    }
  };

  const handleRemoveVariantImage = (_e: Event, index: number) => {
    const variant = formData.variant[index];

    if (variant.image.length) {
      if (variant.new_image.length) {
        variant.new_image.splice(0, 1);
      } else {
        variant.deleted_image.push(variant.image[0].id as string);
        variant.image.splice(0, 1);
      }
    } else {
      variant.new_image.splice(0, 1);
    }
  };

  const isNumeric = (value: unknown) => {
    return /^\d+$/.test(value as string);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const errors = [];

    if (formData.name.trim() === '') {
      form_error.name = 'Product name cannot be empty.';
      errors.push('');
    } else {
      form_error.name = '';
    }

    if (!isNumeric(formData.price)) {
      form_error.price = 'Product price must be a number and cannot be empty.';
      errors.push('');
    } else {
      form_error.price = '';
    }

    if (!isNumeric(formData.stock)) {
      form_error.stock = 'Product stock must be a number and cannot be empty..';
      errors.push('');
    } else {
      form_error.stock = '';
    }

    if (formData.variant.length) {
      formData.variant.map((variant, index) => {
        if (variant.name.trim() === '') {
          form_error.variant[index].name = 'Variant name cannot be empty.';
          errors.push('');
        } else {
          form_error.variant[index].name = '';
        }

        if (!isNumeric(variant.price)) {
          form_error.variant[index].price = 'Variant price must be a number and cannot be empty.';
          errors.push('');
        } else {
          form_error.variant[index].price = '';
        }

        if (!isNumeric(variant.stock)) {
          form_error.variant[index].stock = 'Variant stock must be a number and cannot be empty..';
          errors.push('');
        } else {
          form_error.variant[index].stock = '';
        }
      });
    }

    if (!errors.length) {
      params.id ? mutateEdit() : mutateAdd();
    } else {
      toast.add({ message: 'There\'s some error on some form input, please check again.', type: 'error' });
    }
  };

  return {
    productID: params.id,
    data,
    formData,
    form_error,
    isError,
    isLoading,
    isSuccess,
    handleAddImage,
    handleRemoveImage,
    handleAddVariant,
    handleAddVariantImage,
    handleRemoveVariant,
    handleRemoveVariantImage,
    handleSubmit,
    refetch,
    mutateAddLoading,
    mutateAdd,
    mutateEditLoading,
    mutateEdit,
  };
};
