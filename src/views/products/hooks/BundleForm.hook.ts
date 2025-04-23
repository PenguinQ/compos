import { computed, reactive, ref, inject, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Big from 'big.js';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getBundleDetail, mutateAddBundle, mutateEditBundle } from '@/database/query/bundle';
import { getProductList } from '@/database/query/product';

// Normalizers
import {
  bundleFormDetailNormalizer,
  bundleFormProductListNormalizer,
} from '../normalizer/BundleForm.normalizer'

// Common Helpers
import { debounce, isNumeric, isNumericString } from '@/helpers';

type Product = ReturnType<typeof bundleFormProductListNormalizer>['products'][number];
type Variant = Product['variants'][number];

type FormDataProduct = {
  id: string;
  productId: string;
  active: boolean;
  images: string[];
  name: string;
  price: string;
  totalPrice: string;
  quantity: number;
  stock: number;
  sku: string;
};

type FormData = {
  name: string;
  description: string;
  price: string;
  autoPrice: boolean;
  products: FormDataProduct[];
  selectedProducts: FormDataProduct[];
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
    name            : '',
    description     : '',
    price           : '0',
    autoPrice       : true,
    products        : [],
    selectedProducts: [],
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
  const currentPage = computed(() => page.current);

  const {
    data     : bundleDetail,
    refetch  : bundleDetailRefetch,
    isError  : bundleDetailError,
    isLoading: bundleDetailLoading,
  } = useQuery({
    queryKey: ['bundle-form-details', params.id],
    queryFn: () => getBundleDetail(params.id as string),
    queryNormalizer: bundleFormDetailNormalizer,
    enabled: params.id ? true : false,
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting the bundle detail`, type: 'error' });
      console.error('Error getting the bundle detail,', error.message);
    },
    onSuccess: (response) => {
      if (response) {
        const resp = response;

        if (params.id) {
          formData.name        = resp.name;
          formData.description = resp.description;
          formData.price       = resp.price;
          formData.autoPrice  = resp.autoPrice;

          for (const product of resp.products) {
            formData.products.push({
              id        : product.id,
              productId : product.productId,
              active    : product.active,
              images    : product.images,
              name      : product.name,
              price     : product.price,
              totalPrice: product.totalPrice,
              quantity  : product.quantity,
              stock     : product.stock,
              sku       : product.sku,
            });
            formError.products.push({ quantity: '' });
          }
        }
      }
    },
  });

  const {
    data     : productList,
    refetch  : productListRefetch,
    isLoading: productListLoading,
    isError  : productListError,
  } = useQuery({
    queryKey: ['bundle-form-products', searchQuery, currentPage],
    queryFn: () => getProductList({
      active: true,
      search_query: searchQuery.value,
      sort: 'asc',
      complete: true,
      limit: page.limit,
      page: page.current,
    }),
    queryNormalizer: bundleFormProductListNormalizer,
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
        const { id, productId, active, quantity } = product;

        bundle_products.push({ id, product_id: productId, active, quantity });
      }

      return mutateAddBundle({
        name       : formData.name,
        description: formData.description,
        price      : formData.price,
        auto_price : formData.autoPrice,
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
        const { id, productId, active, quantity } = product;

        bundle_products.push({ id, product_id: productId, active, quantity });
      }

      return mutateEditBundle({
        id         : params.id as string,
        name       : formData.name,
        description: formData.description,
        price      : formData.price,
        auto_price : formData.autoPrice,
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

    if (!isNumericString(formData.price)) {
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

  const handleRemoveProduct = (index: number) => {
    formData.products.splice(index, 1);
    formError.products.splice(index, 1);
  };

  const getUpdatedPrice = (products: FormDataProduct[]) => {
    let total_price = Big(0);

    for (const product of products) {
      const { price, quantity } = product;

      total_price = total_price.plus(Big(price).times(quantity));
    }

    return total_price.toFixed();
  };

  /**
   * -----------------------------
   * Product list Dialog functions
   * -----------------------------
   */
  const handleOpenDialog = () => {
    loadProducts.value = true;
    formData.selectedProducts = [...formData.products];
  };

  const handleCloseDialog = (_e: Event, save?: boolean) => {
    if (save) {
      formData.products = [...formData.selectedProducts];
    }

    formData.selectedProducts = [];
    showProductsDialog.value   = false;
    page.current               = 1;
  };

  const handleSelectProduct = (data: Product) => {
    const { id, active, images, name, price, variants, sku, stock } = data;
    const products = formData.selectedProducts;

    if (variants.length) {
      const variant_ids = variants.map(variant => variant.id);
      const is_variants_selected = variant_ids.every(id => products.some(product => id === product.id));

      if (is_variants_selected) {
        formData.selectedProducts = products.filter(product => !variant_ids.some(id => id === product.id));
      } else {
        for (const variant of variants) {
          const { id, productId, active, images, name: variant_name, price, sku, stock } = variant;
          const is_variant_selected = products.find(product => product.id === id);

          if (!is_variant_selected) {
            products.push({
              name      : `${name} - ${variant_name}`,
              totalPrice: Big(price).times(1).toFixed(),
              quantity  : 1,
              sku       : sku || '',
              productId : productId,
              id,
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
          productId : '',
          totalPrice: Big(price).times(1).toFixed(),
          quantity  : 1,
          sku       : sku || '',
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

  const handleSelectVariant = (data: Variant, product_name: string) => {
    const { id, productId, active, images, name, price, sku, stock } = data;
    const products = formData.selectedProducts;
    const selected = products.find(product => product.id === id);

    if (selected) {
      const index = products.indexOf(selected);

      products.splice(index, 1);
      formError.products.splice(index, 1);
    } else {
      products.push({
        name      : `${product_name} - ${name}`,
        totalPrice: Big(price).times(1).toString(),
        quantity  : 1,
        sku       : sku || '',
        productId,
        id,
        active,
        images,
        price,
        stock,
      });
      formError.products.push({ quantity: '' });
    }
  };

  const isProductSelected = (data: Product) => {
    const { id, variants } = data;
    const products = formData.selectedProducts;

    if (variants.length) {
      const variant_ids = variants.map(variant => variant.id);

      return variant_ids.every(id => products.some(product => id === product.id));
    }

    return products.find(product => product.id === id);
  };

  const isVariantSelected = (id: string) => {
    return formData.selectedProducts.find(product => product.id === id);
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

  /**
   * ----------------------
   * PullToRefresh handlers
   * ----------------------
   */
  const handleRefresh = async (loading: any) => {
    formData.name             = '';
    formData.description      = '';
    formData.price            = '0';
    formData.autoPrice        = true;
    formData.products         = [];
    formData.selectedProducts = [];
    formError.name            = '';
    formError.price           = '';
    formError.products        = [];

    await bundleDetailRefetch();
    loading.complete();
  };

  const handleRefreshList = async (loading: any) => {
    const resetPage = async () => {
      loadProducts.value = false;
      page.current       = 1;
      page.first         = true;
      page.last          = true;
      loadProducts.value = true;
    };

    await resetPage();
    await productListRefetch();
    loading.complete();
  };

  watch(
    () => formData.products,
    (products) => {
      if (formData.autoPrice) {
        formData.price = getUpdatedPrice(products);
      }
    },
    { deep: true },
  );

  watch(
    () => formData.autoPrice,
    (auto_price) => {
      if (auto_price) {
        formData.price = getUpdatedPrice(formData.products);
      }
    },
  );

  return {
    bundleId: params.id,
    bundleDetail,
    productList,
    // bundleDetail: bundleDetail as Ref<FormDetailNormalizerReturn>,
    // productList: productList as Ref<FormProductListNormalizerReturn>,
    formData,
    formError,
    page,
    searchQuery,
    loadProducts,
    showProductsDialog,
    productListError,
    productListLoading,
    bundleDetailError,
    bundleDetailLoading,
    mutateAddLoading,
    mutateEditLoading,
    productListRefetch,
    bundleDetailRefetch,
    mutateAdd,
    mutateEdit,
    handleSearch,
    handleOpenDialog,
    handleCloseDialog,
    handleSubmit,
    handleSelectProduct,
    handleSelectVariant,
    handleRemoveProduct,
    handleRefresh,
    handleRefreshList,
    isProductSelected,
    isVariantSelected,
    toPrevPage,
    toNextPage,
  };
};
