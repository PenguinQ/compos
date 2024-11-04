import { reactive, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getProductDetail, mutateAddProduct, mutateEditProduct } from '@/database/query/product'

// Normalizers
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
  price: string;
  stock: number;
  sku: string;
  images: Image[];
  newImages: NewImage[];
  deletedImages: string[];
};

type FormData = {
  id: string;
  name: string;
  description: string;
  by: string;
  price: string;
  stock: number;
  sku: string;
  variants: FormDataVariant[];
  deletedVariants: string[];
  images: Image[];
  newImages: NewImage[];
  deletedImages: string[]
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
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const formData = reactive<FormData>({
    id              : '',
    name            : '',
    description     : '',
    by              : '',
    price           : '0',
    stock           : 0,
    sku             : '',
    variants        : [],
    deletedVariants : [],
    images          : [],
    newImages       : [],
    deletedImages   : [],
  });
  const formError = reactive<FormError>({
    name    : '',
    price   : '',
    stock   : '',
    variants: [],
  });

  const {
    data     : productDetail,
    refetch  : productDetailRefetch,
    isError  : productDetailError,
    isLoading: productDetailLoading,
  } = useQuery({
    queryKey: ['product-form-details', params.id],
    queryFn: () => getProductDetail({
      id: params.id as string,
      normalizer: formDetailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the product detail.', type: 'error' });
      console.error('Failed to get the product detail.', error.message);
    },
    onSuccess: (response: unknown) => {
      const resp = response as ProductFormNormalizerReturn;

      if (params.id) {
        formData.id          = resp.id;
        formData.name        = resp.name;
        formData.description = resp.description;
        formData.by          = resp.by;
        formData.images      = resp.images;
        formData.price       = resp.price;
        formData.stock       = resp.stock;
        formData.sku         = resp.sku;

        for (const variant of resp.variants) {
          formData.variants.push({
            id            : variant.id,
            product_id    : variant.product_id,
            name          : variant.name,
            price         : variant.price,
            stock         : variant.stock,
            images        : variant.images,
            newImages     : [],
            deletedImages : [],
            sku           : variant.sku,
          });

          formError.variants.push({
            name : '',
            price: '',
            stock: '',
            sku  : '',
          });
        }
      }
    },
  });

  const {
    mutate   : mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    mutateFn: () => {
      const newProductImages = formData.newImages.length ? formData.newImages.map(img => img.data) : [];
      const variantsData     = formData.variants.map(variant => {
        const {
          id,
          name,
          price,
          stock,
          sku,
          newImages,
          deletedImages,
        } = variant;
        const newVariantImages = newImages.length ? newImages.map(img => img.data) : [];

        return {
          new_images    : newVariantImages,
          deleted_images: deletedImages,
          id,
          name,
          sku,
          price,
          stock,
        };
      });

      return mutateEditProduct({
        id  : params.id as string,
        data: {
          name            : formData.name,
          description     : formData.description,
          by              : formData.by,
          price           : formData.price,
          stock           : formData.stock,
          sku             : formData.sku,
          new_images      : newProductImages,
          deleted_images  : formData.deletedImages,
          variants        : variantsData,
          deleted_variants: formData.deletedVariants,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error updating product detail. ${error.message}`, type: 'error' });
      console.error('Error updating product detail.', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Product detail updated.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate   : mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const newProductImages = formData.newImages.length ? formData.newImages.map(img => img.data) : [];
      const variantsData = formData.variants.map(variant => {
        const { newImages, ...rest } = variant;
        const newVariantImages = newImages.length ? newImages.map(img => img.data) : [];

        return {
          new_images: newVariantImages,
          ...rest,
        };
      });

      console.log(variantsData);

      return mutateAddProduct({
        name       : formData.name,
        description: formData.description,
        by         : formData.by,
        price      : formData.price,
        stock      : formData.stock,
        sku        : formData.sku,
        variants   : variantsData,
        new_images : newProductImages,
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error adding new product.', type: 'error' });
      console.error('Error adding new product.', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Product added.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const handleAddImage = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files  = target.files as FileList;

    if (isImagesValid([...files])) {

      formData.newImages = [];

      for (const file of files) {
        const reader = new FileReader();

        reader.onload = () => {
          formData.newImages.push({ data: file, url: reader.result });
        };

        reader.readAsDataURL(file);
      }
    } else {
      // @ts-ignore
      toast.add({ message: 'Invalid file type, please use image file only.', type: 'error' });
    }
  };

  const handleAddVariantImage = (e: Event, index: number) => {
    const target = e.target as HTMLInputElement;
    const files  = target.files as FileList;

    if (isImagesValid([...files])) {

      formData.variants[index].newImages = [];

      for (const file of files) {
        const reader = new FileReader();

        reader.onload = () => {
          formData.variants[index].newImages.push({ data: file, url: reader.result });
        };

        reader.readAsDataURL(file);
      }
    } else {
      // @ts-ignore
      toast.add({ message: 'Invalid file type, please use image file only.', type: 'error' });
    }
  };

  const handleAddVariant = () => {
    formData.variants.push({
      name          : '',
      price         : '0',
      stock         : 0,
      images        : [],
      newImages     : [],
      deletedImages : [],
      sku           : '',
    });
    formError.variants.push({
      name : '',
      price: '',
      stock: '',
      sku  : '',
    });
  };

  const handleRemoveVariant = (index: number, id?: string) => {
    id && formData.deletedVariants.push(id);
    formData.variants.splice(index, 1);
  };

  const handleRemoveImage = () => {
    if (formData.images.length) {
      if (formData.newImages.length) {
        formData.newImages = [];
      } else {
        for (const image of formData.images) {
          formData.deletedImages.push(image.id!)
        }

        formData.images = [];
      }
    } else {
      formData.newImages = [];
    }
  };

  const handleRemoveVariantImage = (_e: Event, index: number) => {
    const variant = formData.variants[index];

    if (variant.images.length) {
      if (variant.newImages.length) {
        variant.newImages = [];
      } else {
        for (const image of variant.images) {
          variant.deletedImages.push(image.id!)
        }

        variant.images = [];
      }
    } else {
      variant.newImages = [];
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    const errors = [];

    if (formData.name.trim() === '') {
      formError.name = 'Product name cannot be empty.';
      errors.push('');
    } else {
      formError.name = '';
    }

    if (!isNumeric(formData.price)) {
      formError.price = 'Product price must be a number and cannot be empty.';
      errors.push('');
    } else {
      formError.price = '';
    }

    if (!isNumeric(formData.stock)) {
      formError.stock = 'Product stock must be a number and cannot be empty.';
      errors.push('');
    } else {
      formError.stock = '';
    }

    if (formData.variants.length) {
      formData.variants.map((variant, index) => {
        if (variant.name.trim() === '') {
          formError.variants[index].name = 'Variant name cannot be empty.';
          errors.push('');
        } else {
          formError.variants[index].name = '';
        }

        if (!isNumeric(variant.price)) {
          formError.variants[index].price = 'Variant price must be a number and cannot be empty.';
          errors.push('');
        } else {
          formError.variants[index].price = '';
        }

        if (!isNumeric(variant.stock)) {
          formError.variants[index].stock = 'Variant stock must be a number and cannot be empty.';
          errors.push('');
        } else {
          formError.variants[index].stock = '';
        }
      });
    }

    if (!errors.length) {
      params.id ? mutateEdit() : mutateAdd();
    } else {
      // @ts-ignore
      toast.add({ message: `There's error in some of the fields, please check again.`, type: 'error' });
    }
  };

  return {
    productId    : params.id,
    productDetail: productDetail as Ref<ProductFormNormalizerReturn>,
    formData,
    formError,
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
