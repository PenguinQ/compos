import { computed, reactive, ref, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Big from 'big.js';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getBundleDetail, mutateAddBundle, mutateEditBundle } from '@/database/query/bundle';
import { getProductList } from '@/database/query/product';

// Normalizers
import { formDetailNormalizer, formProductListNormalizer } from '../normalizer/BundleForm.normalizer'

// Common Helpers
import { debounce, isNumeric } from '@/helpers';

// Types
import type {
  FormDetailNormalizerReturn,
  FormDetailProduct,
  FormProductListNormalizerReturn,
  FormProductListProduct,
  FormProductListVariant,
} from '../normalizer/BundleForm.normalizer';

type FormDataProduct = {
  id: string;
  product_id: string;
  active: boolean;
  images: string[];
  name: string;
  price: string;
  total_price: string;
  quantity: number;
  stock: number;
  sku: string;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  auto_price: boolean;
  products: FormDataProduct[];
  selected_products: FormDataProduct[];
};

type FormErrorProducts = {
  quantity: string;
};

type FormError = {
  name: string;
  price: string;
  products: FormErrorProducts[];
};

export const useBundleForm = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const searchQuery        = ref('');
  const loadProducts       = ref(false);
  const showProductsDialog = ref(false);
  const formData: FormData = reactive({
    name             : '',
    description      : '',
    price            : '0',
    auto_price       : true,
    products         : [],
    selected_products: [],
  });
  const formError: FormError = reactive({
    name    : '',
    price   : '',
    products: [],
  });
  const page = reactive({
    current: 1,
    total  : 1,
    limit  : 10,
    first  : true,
    last   : true,
  });
  const current_page = computed(() => page.current);

  const {
    data     : bundleDetail,
    refetch  : bundleDetailRefetch,
    isError  : bundleDetailError,
    isLoading: bundleDetailLoading,
  } = useQuery({
    queryKey: ['bundle-form-details', params.id],
    queryFn: () => getBundleDetail({
      id: params.id as string,
      normalizer: formDetailNormalizer,
    }),
    enabled: params.id ? true : false,
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting the bundle detail`, type: 'error' });
      console.error('Error getting the bundle detail,', error.message);
    },
    onSuccess: (response: unknown) => {
      const resp = response as FormDetailNormalizerReturn;

      if (params.id) {
        formData.name        = resp.name;
        formData.description = resp.description;
        formData.price       = resp.price;
        formData.auto_price  = resp.auto_price;

        for (const product of resp.products) {
          formData.products.push({
            id         : product.id,
            product_id : product.product_id,
            active     : product.active,
            images     : product.images,
            name       : product.name,
            price      : product.price,
            total_price: product.total_price,
            quantity   : product.quantity,
            stock      : product.stock,
            sku        : product.sku,
          });
          formError.products.push({ quantity: '' });
        }
      }
    },
  });

  const {
    data     : product_list,
    refetch  : productListRefetch,
    isLoading: productListLoading,
    isError  : productListError,
  } = useQuery({
    queryKey: ['bundle-form-products', searchQuery, current_page],
    queryFn: () => getProductList({
      active: true,
      search_query: searchQuery.value,
      sort: 'asc',
      complete: true,
      limit: page.limit,
      page: page.current,
      normalizer: formProductListNormalizer,
    }),
    enabled: loadProducts,
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting product list`, type: 'error' });
      console.error('Error getting product list,', error.message);
    },
    onSuccess: (response: unknown) => {
      if (response) {
        const { page: response_page } = response as any;

        page.total = response_page.total;
        page.first = response_page.first;
        page.last  = response_page.last;
      }
    },
  })

  const {
    mutate   : mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const bundle_products = [];

      for (const product of formData.products) {
        const { id, product_id, active, quantity } = product;

        bundle_products.push({ id, product_id, active, quantity });
      }

      return mutateAddBundle({
        name       : formData.name,
        description: formData.description,
        price      : formData.price,
        auto_price : formData.auto_price,
        products   : bundle_products,
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error adding new bundle`, type: 'error' });
      console.error('Error adding new bundle,', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Bundle added', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate   : mutateEdit,
    isLoading: mutateEditLoading,
  } = useMutation({
    mutateFn: () => {
      const bundle_products = [];

      for (const product of formData.products) {
        const { id, product_id, active, quantity } = product;

        bundle_products.push({ id, product_id, active, quantity });
      }

      return mutateEditBundle({
        id         : params.id as string,
        name       : formData.name,
        description: formData.description,
        price      : formData.price,
        auto_price : formData.auto_price,
        products   : bundle_products,
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error updating the bundle`, type: 'error' });
      console.error('Error updating the bundle,', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Bundle detail updated', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;

    page.current = 1;
    searchQuery.value = target.value;
  });

  const handleSubmit = () => {
    const errors = [];

    if (formData.name.trim() === '') {
      formError.name = 'Bundle name cannot be empty.';
      errors.push('');
    } else {
      formError.name = '';
    }

    if (!isNumeric(formData.price)) {
      formError.price = 'Bundle price must be a number and cannot be empty.';
      errors.push('');
    } else {
      formError.price = '';
    }

    if (formData.products.length) {
      formData.products.forEach((product, index) => {
        if (!isNumeric(product.quantity)) {
          formError.products[index].quantity = 'Product quantity must be a number and cannot be empty.';
          errors.push('');
        } else {
          formError.products[index].quantity = '';
        }
      });
    }

    if (!errors.length) {
      params.id ? mutateEdit() : mutateAdd();
    } else {
      // @ts-ignore
      toast.add({ message: 'There is an error in some form input; please check again', type: 'error' });
    }
  };

  const toPrevPage = (_e: Event, toFirst?: boolean) => {
    if (toFirst) {
      page.current = 1;
    } else {
      if (page.current > 1) page.current -= 1;
    }

    !page.first && productListRefetch();
  };

  const toNextPage = (_e: Event, toLast?: boolean) => {
    if (toLast) {
      page.current = page.total;
    } else {
      if (page.current < page.total) page.current += 1;
    }

    !page.last && productListRefetch();
  };

  const handleOpenDialog = () => {
    loadProducts.value = true;
    formData.selected_products = [...formData.products];
  };

  const handleCloseDialog = (_e: Event, save?: boolean) => {
    if (save) {
      formData.products = [...formData.selected_products];
    }

    formData.selected_products = [];
    showProductsDialog.value   = false;
    page.current               = 1;
  };

  const handleSelectProduct = (data: FormProductListProduct) => {
    const { id, active, images, name, price, variants, sku, stock } = data;
    const products = formData.selected_products;

    if (variants.length) {
      const variant_ids = variants.map(variant => variant.id);
      const is_variants_selected = variant_ids.every(id => products.some(product => id === product.id));

      if (is_variants_selected) {
        formData.selected_products = products.filter(product => !variant_ids.some(id => id === product.id));
      } else {
        for (const variant of variants) {
          const { id, product_id, active, images, name: variant_name, price, sku, stock } = variant;
          const is_variant_selected = products.find(product => product.id === id);

          if (!is_variant_selected) {
            products.push({
              name       : `${name} - ${variant_name}`,
              total_price: Big(price).times(1).toString(),
              quantity   : 1,
              sku        : sku || '',
              id,
              product_id,
              active,
              images,
              price,
              stock,
            });
            formError.products.push({ quantity: '' });
          }
        }
      }
    } else {
      const is_product_selected = products.find(product => product.id === id);

      if (is_product_selected) {
        const index = products.indexOf(is_product_selected);

        products.splice(index, 1);
        formError.products.splice(index, 1);
      } else {
        products.push({
          product_id : '',
          total_price: Big(price).times(1).toString(),
          quantity   : 1,
          sku        : sku || '',
          id,
          active,
          images,
          name,
          price,
          stock,
        });
        formError.products.push({ quantity: '' });
      }
    }
  };

  const handleSelectVariant = (data: FormProductListVariant, product_name: string) => {
    const { id, product_id, active, images, name, price, sku, stock } = data;
    const products = formData.selected_products;
    const selected = products.find(product => product.id === id);

    if (selected) {
      const index = products.indexOf(selected);

      products.splice(index, 1);
      formError.products.splice(index, 1);
    } else {
      products.push({
        name       : `${product_name} - ${name}`,
        total_price: Big(price).times(1).toString(),
        quantity   : 1,
        sku        : sku || '',
        id,
        product_id,
        active,
        images,
        price,
        stock,
      });
      formError.products.push({ quantity: '' });
    }
  };

  const handleRemoveProduct = (index: number) => {
    formData.products.splice(index, 1);
    formError.products.splice(index, 1);
  };

  const isProductSelected = (data: FormProductListProduct) => {
    const { id, variants } = data;
    const products = formData.selected_products;

    if (variants.length) {
      const variant_ids = variants.map(variant => variant.id);

      return variant_ids.every(id => products.some(product => id === product.id));
    }

    return products.find(product => product.id === id);
  };

  const isVariantSelected = (id: string) => {
    return formData.selected_products.find(product => product.id === id);
  };

  const handleChangeQuantity = (e: Event, product: FormDetailProduct) => {

    const target = e.target as HTMLInputElement;

    if (!isNumeric(target.value)) {
      product.quantity = 1;
      product.total_price = Big(product.price).times(1).toString();
    }
  };

  const handleUpdateQuantity = (e: Event | string, product: FormDetailProduct) => {
    let quantity = 0;

    if (typeof e === 'string') {
      quantity = parseInt(e);
    } else {
      const target_value = (e.target as HTMLInputElement).value;
      quantity = parseInt(target_value ? target_value : '0');
    }

    product.quantity = quantity;
    product.total_price = Big(product.price).times(quantity).toString();
  };

  const getUpdatedPrice = (products: FormDataProduct[]) => {
    let total_price = Big(0);

    for (const product of products) {
      const { price, quantity } = product;

      total_price = total_price.plus(Big(price).times(quantity));
    }

    return total_price.toString();
  };

  const handleRefresh = async (e: any) => {
    // Reset any possible dynamic fields
    formData.name              = '';
    formData.description       = '';
    formData.price             = '0';
    formData.auto_price        = true;
    formData.products          = [];
    formData.selected_products = [];
    formError.name             = '';
    formError.price            = '';
    formError.products         = [];

    await bundleDetailRefetch();
    e.complete();
  };

  const handleRefreshList = async (e: any) => {
    const resetPage = async () => {
      loadProducts.value = false;
      page.current       = 1;
      page.first         = true;
      page.last          = true;
      loadProducts.value = true;
    };

    await resetPage();
    await productListRefetch();
    e.complete();
  };

  watch(
    () => formData.products,
    (products) => {
      if (formData.auto_price) {
        formData.price = getUpdatedPrice(products);
      }
    },
    { deep: true },
  );

  watch(
    () => formData.auto_price,
    (auto_price) => {
      if (auto_price) {
        formData.price = getUpdatedPrice(formData.products);
      }
    },
  );

  return {
    bundleId: params.id,
    bundleDetail: bundleDetail as Ref<FormDetailNormalizerReturn>,
    formData,
    formError,
    page,
    searchQuery,
    loadProducts,
    showProductsDialog,
    product_list: product_list as Ref<FormProductListNormalizerReturn>,
    productListError,
    productListLoading,
    productListRefetch,
    bundleDetailError,
    bundleDetailLoading,
    bundleDetailRefetch,
    handleSearch,
    handleOpenDialog,
    handleCloseDialog,
    handleChangeQuantity,
    handleUpdateQuantity,
    handleSubmit,
    isProductSelected,
    isVariantSelected,
    handleSelectProduct,
    handleSelectVariant,
    handleRemoveProduct,
    handleRefresh,
    handleRefreshList,
    toPrevPage,
    toNextPage,
    mutateAdd,
    mutateAddLoading,
    mutateEdit,
    mutateEditLoading
  };
};
