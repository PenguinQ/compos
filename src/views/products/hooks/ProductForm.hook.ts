import { reactive, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getProductDetail, mutateAddProduct, mutateEditProduct } from '@/database/query/product'

// Normalizer
import { formDetailNormalizer } from '../normalizer/ProductForm.normalizer';
import type { ProductFormNormalizerReturn } from '../normalizer/ProductForm.normalizer';

// Helpers
import { isImagesValid, isNumeric } from '@/helpers';

type Image = {
  id?: string;
  data?: File;
  url: string | ArrayBuffer | null;
};

type NewImage = {
  data: File;
  url: string | ArrayBuffer | null;
};

type FormDataVariant = {
  id?: string;
  product_id?: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  image: Image[];
  new_image: NewImage[];
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
  variants: FormDataVariant[];
  deleted_variants: string[];
  image: Image[];
  new_image: NewImage[];
  deleted_image: string[];
};

type FormErrorVariant = {
  name: string;
  price: string;
  stock: string;
  sku: string;
};

type FormError = {
  name: string;
  price: string;
  stock: string;
  variants: FormErrorVariant[];
};

export const useProductForm = () => {
  const route = useRoute();
  const router = useRouter();
  const toast = inject('ToastProvider');
  const { params } = route;
  const form_data = reactive<FormData>({
    id: '',
    name: '',
    description: '',
    by: '',
    price: 0,
    stock: 0,
    sku: '',
    variants: [],
    deleted_variants: [],
    image: [],
    new_image: [],
    deleted_image: [],
  });
  const form_error = reactive<FormError>({
    name: '',
    price: '',
    stock: '',
    variants: [],
  });

  const {
    refetch: productDetailRefetch,
    isError: productDetailError,
    isLoading: productDetailLoading,
  } = useQuery({
    queryFn: () => getProductDetail({
      id: params.id as string,
      normalizer: formDetailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the product detail.', type: 'error' });
      console.error('[ERROR] Failed to get the product detail.', error);
    },
    onSuccess: (response: unknown) => {
      const resp = response as ProductFormNormalizerReturn;

      if (params.id) {
        form_data.id = resp.id;
        form_data.name = resp.name;
        form_data.description = resp.description;
        form_data.by = resp.by;
        form_data.image = resp.image;
        form_data.price = resp.price;
        form_data.stock = resp.stock;
        form_data.sku = resp.sku;

        resp.variants.forEach(v => {
          form_data.variants.push({
            id: v.id,
            product_id: v.product_id,
            name: v.name,
            price: v.price,
            stock: v.stock,
            image: v.image,
            new_image: [],
            deleted_image: [],
          });

          form_error.variants.push({
            name: '',
            price: '',
            stock: '',
            sku: '',
          });
        });
      }
    },
  });

  const {
    mutate: mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    mutateFn: () => {
      const new_product_image = form_data.new_image.length ? form_data.new_image.map(img => img.data) : [];
      const variants_data = form_data.variants.map(variant => {
        const { id, name, price, stock, sku, new_image, deleted_image } = variant;
        const new_variant_image = new_image.length ? new_image.map(img => img.data) : [];

        return {
          id,
          name,
          sku,
          price,
          stock,
          new_images: new_variant_image,
          deleted_images: deleted_image,
        };
      });

      return mutateEditProduct({
        id: params.id as string,
        data: {
          name: form_data.name,
          description: form_data.description,
          by: form_data.by,
          price: form_data.price,
          stock: form_data.stock,
          sku: form_data.sku,
          new_images: new_product_image,
          deleted_images: form_data.deleted_image,
          variants: variants_data,
          deleted_variants: form_data.deleted_variants,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error updating product detail, ${error}`, type: 'error' });
      console.error('[ERROR] Error mutating product detail.', error);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Product detail updated.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const new_product_image = form_data.new_image.length ? form_data.new_image.map(img => img.data) : [];
      const variants_data = form_data.variants.map(variant => {
        const { new_image, ...rest } = variant;
        const new_variant_image = new_image.length ? new_image.map(image => image.data) : [];

        return {
          new_image: new_variant_image,
          ...rest,
        };
      });

      return mutateAddProduct({
        data: {
          name: form_data.name,
          description: form_data.description,
          by: form_data.by,
          price: form_data.price,
          stock: form_data.stock,
          sku: form_data.sku,
          variant: variants_data,
          new_image: new_product_image,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error adding new product.', type: 'error' });
      console.error('[ERROR] Error adding new product.', error);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Product added.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const handleAddImage = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;

    if (isImagesValid([...files])) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        if (form_data.new_image.length) {
          form_data.new_image[0].data = file;
          form_data.new_image[0].url = reader.result;
        } else {
          form_data.new_image.push({ data: file, url: reader.result });
        }
      };

      reader.readAsDataURL(file);
    } else {
      // @ts-ignore
      toast.add({ message: 'Invalid file type, please use image file only.', type: 'error' });
    }
  };

  const handleAddVariantImage = (e: Event, index: number) => {
    const target = e.target as HTMLInputElement;
    const files = target.files as FileList;

    [...files].forEach(async (file: File) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (form_data.variants[index].new_image.length) {
          form_data.variants[index].new_image[0].data = file;
          form_data.variants[index].new_image[0].url = reader.result;
        } else {
          form_data.variants[index].new_image.push({ data: file, url: reader.result });
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleAddVariant = () => {
    form_data.variants.push({
      name: '',
      price: 0,
      stock: 0,
      image: [],
      new_image: [],
      deleted_image: [],
    });
    form_error.variants.push({
      name: '',
      price: '',
      stock: '',
      sku: '',
    });
  };

  const handleRemoveVariant = (index: number, id?: string) => {
    id && form_data.deleted_variants.push(id);
    form_data.variants.splice(index, 1);
  };

  const handleRemoveImage = () => {
    if (form_data.image) {
      if (form_data.new_image) {
        form_data.new_image.splice(0, 1);
      } else {
        form_data.deleted_image.push(form_data.image[0].id as string);
        form_data.image.splice(0, 1);
      }
    } else {
      form_data.new_image.splice(0, 1);
    }
  };

  const handleRemoveVariantImage = (_e: Event, index: number) => {
    const variant = form_data.variants[index];

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

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const errors = [];

    if (form_data.name.trim() === '') {
      form_error.name = 'Product name cannot be empty.';
      errors.push('');
    } else {
      form_error.name = '';
    }

    if (!isNumeric(form_data.price)) {
      form_error.price = 'Product price must be a number and cannot be empty.';
      errors.push('');
    } else {
      form_error.price = '';
    }

    if (!isNumeric(form_data.stock)) {
      form_error.stock = 'Product stock must be a number and cannot be empty..';
      errors.push('');
    } else {
      form_error.stock = '';
    }

    if (form_data.variants.length) {
      form_data.variants.map((variant, index) => {
        if (variant.name.trim() === '') {
          form_error.variants[index].name = 'Variant name cannot be empty.';
          errors.push('');
        } else {
          form_error.variants[index].name = '';
        }

        if (!isNumeric(variant.price)) {
          form_error.variants[index].price = 'Variant price must be a number and cannot be empty.';
          errors.push('');
        } else {
          form_error.variants[index].price = '';
        }

        if (!isNumeric(variant.stock)) {
          form_error.variants[index].stock = 'Variant stock must be a number and cannot be empty..';
          errors.push('');
        } else {
          form_error.variants[index].stock = '';
        }
      });
    }

    if (!errors.length) {
      params.id ? mutateEdit() : mutateAdd();
    } else {
      // @ts-ignore
      toast.add({ message: 'There\'s some error on some form input, please check again.', type: 'error' });
    }
  };

  return {
    product_id: params.id,
    form_data,
    form_error,
    productDetailError,
    productDetailLoading,
    productDetailRefetch,
    handleAddImage,
    handleRemoveImage,
    handleAddVariant,
    handleAddVariantImage,
    handleRemoveVariant,
    handleRemoveVariantImage,
    handleSubmit,
    mutateAddLoading,
    mutateAdd,
    mutateEditLoading,
    mutateEdit,
  };
};
