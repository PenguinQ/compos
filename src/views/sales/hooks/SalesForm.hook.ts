import { computed, inject, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Ref } from 'vue';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getSalesFormDetail, mutateAddSales, mutateEditSales } from '@/database/query/sales';
import { getProductList } from '@/database/query/product';
import { getBundleList } from '@/database/query/bundle';

// Normalizers
import {
  detailNormalizer,
  productListNormalizer,
  bundleListNormalizer,
} from '../normalizer/SalesForm.normalizer';
import type {
  DetailNormalizerReturn,
  ProductListNormalizerReturn,
  BundleListNormalizerReturn,
  ProductList,
  ProductListVariant,
  BundleList,
} from '../normalizer/SalesForm.normalizer';

// Helpers
import { debounce, isNumeric } from '@/helpers';

type FormDataProduct = {
  id: string;
  images: string[];
  name: string;
  quantity: number;
};

type FormData = {
  id: string;
  name: string;
  balance?: string;
  products: FormDataProduct[];
};

export const useSalesForm = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const searchProductQuery = ref('')
  const searchBundleQuery  = ref('');
  const loadProducts       = ref(false);
  const loadBundles        = ref(false);
  const showDialog         = ref(false);
  const selectedProducts   = ref<FormDataProduct[]>([]);
  const productListTab     = ref(0);
  const formData = reactive<FormData>({
    id      : '',
    name    : '',
    balance : '',
    products: [],
  });
  const formError = reactive({
    name   : '',
    product: '',
    balance: '',
  });
  const pageBundle = reactive({
    current: 1,
    total  : 1,
    limit  : 10,
    first  : true,
    last   : true,
  });
  const pageProduct = reactive({
    current: 1,
    total  : 1,
    limit  : 10,
    first  : true,
    last   : true,
  });
  const current_page_product = computed(() => pageProduct.current);
  const current_page_bundle  = computed(() => pageBundle.current);

  const {
    refetch  : detailRefetch,
    isError  : isDetailError,
    isLoading: isDetailLoading,
  } = useQuery({
    enabled: params.id ? true : false,
    queryKey: ['sales-form-details', params.id],
    queryFn: () => getSalesFormDetail({
      id        : params.id as string,
      normalizer: detailNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting sales detail.', type: 'error' });
      console.error('Error getting sales detail.', error.message);
    },
    onSuccess: response => {
      const { name, balance, products } = response as DetailNormalizerReturn;

      console.log(response);

      formData.name     = name;
      formData.products = products;
      if (balance) formData.balance  = balance;
    },
  });

  const {
    data     : productList,
    isError  : isProductListError,
    isLoading: isProductListLoading,
    refetch  : productListRefetch,
  } = useQuery({
    enabled : loadProducts,
    queryKey: ['sales-form-products', searchProductQuery, current_page_product],
    queryFn : () => getProductList({
      active      : true,
      search_query: searchProductQuery.value,
      sort        : 'desc',
      complete    : true,
      limit       : pageProduct.limit,
      page        : pageProduct.current,
      normalizer  : productListNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting product list.', type: 'error' });
      console.error('Error getting product list.', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { page: response_page } = response as ProductListNormalizerReturn;

        pageProduct.total = response_page.total;
        pageProduct.first = response_page.first;
        pageProduct.last  = response_page.last;
      }
    },
  });

  const {
    data     : bundleList,
    isError  : isBundleListError,
    isLoading: isBundleListLoading,
    refetch  : bundleListRefetch,
  } = useQuery({
    enabled : loadBundles,
    queryKey: ['sales-form-bundles', searchBundleQuery, current_page_bundle],
    queryFn : () => getBundleList({
      active      : true,
      search_query: searchBundleQuery.value,
      sort        : 'desc',
      limit       : pageBundle.limit,
      page        : pageBundle.current,
      normalizer  : bundleListNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting product list.', type: 'error' });
      console.error('Error getting product list.', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { page: response_page } = response as BundleListNormalizerReturn;

        pageBundle.total = response_page.total;
        pageBundle.first = response_page.first;
        pageBundle.last  = response_page.last;
      }
    },
  })

  const {
    mutate   : mutateAdd,
    isLoading: isMutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const products_data: { id: string; quantity: number; }[] = [];

      for (const product of formData.products) {
        products_data.push({ id: product.id, quantity: product.quantity });
      }

      return mutateAddSales({
        data: {
          name    : formData.name,
          balance : formData.balance,
          products: products_data,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error adding new sale.', type: 'error' });
      console.error('Error adding new sales.', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Sales added.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate   : mutateEdit,
    isLoading: isMutateEditLoading,
  } = useMutation({
    mutateFn: () => {
      const products_data: { id: string; quantity: number; }[] = [];

      for (const product of formData.products) {
        products_data.push({ id: product.id, quantity: product.quantity });
      }

      return mutateEditSales({
        id  : params.id as string,
        data: {
          name    : formData.name,
          balance : formData.balance,
          products: products_data,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error updating sales.', type: 'error' });
      console.error('Error updating sales.', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `[Sales] ${response} updated.`, type: 'success', duration: 2000 });
      router.back();
    },
  });

  const handleSearch = debounce((e: Event, type: string) => {
    const target = e.target as HTMLInputElement;

    if (type === 'product') {
      searchProductQuery.value = target.value;
      pageProduct.current      = 1;
    } else {
      searchBundleQuery.value = target.value
      pageBundle.current      = 1;
    }
  });

  const toPrevPage = (type: string, toFirst?: boolean) => {
    const pagination = type === 'product' ? pageProduct : pageBundle;

    if (toFirst) {
      pagination.current = 1;
    } else {
      if (pagination.current > 1) pagination.current -= 1;
    }

    if (!pagination.first) {
      if (type === 'product') productListRefetch();
      if (type === 'bundle')  bundleListRefetch();
    }
  };

  const toNextPage = (type: string, toLast?: boolean) => {
    const pagination = type === 'product' ? pageProduct : pageBundle;

    if (toLast) {
      pagination.current = pagination.total;
    } else {
      if (pagination.current < pagination.total) pagination.current += 1;
    }

    if (!pagination.last) {
      if (type === 'product') productListRefetch();
      if (type === 'bundle')  bundleListRefetch();
    }
  };

  const isBundleSelected = (data: BundleList) => {
    const { id } = data;
    const products = selectedProducts.value;

    return products.find(product => product.id === id);
  };

  const isProductSelected = (data: ProductList) => {
    const { id, variants: variants } = data;
    const products = selectedProducts.value;

    if (variants.length) {
      const variants_id: string[] = [];

      variants.forEach(variant => variants_id.push(variant.id));

      return variants_id.every(id => products.some(product => id === product.id));
    }

    return products.find(product => product.id === id);
  };

  const isVariantSelected = (id: string) => {
    return selectedProducts.value.find(product => product.id === id);;
  };

  const handleSelectBundle = (data: BundleList) => {
    const { id, images, name } = data;
    const products = selectedProducts.value;
    const selected = products.find(product => product.id === id);

    if (selected) {
      const index = products.indexOf(selected);

      products.splice(index, 1);
    } else {
      products.push({ id, images, name, quantity: 1 });
    }
  };

  const handleSelectProduct = (data: ProductList) => {
    const { id, images, name, variants: variants } = data;
    const products = selectedProducts.value;

    if (variants.length) {
      const variants_id: string[] = [];

      variants.forEach(variant => variants_id.push(variant.id));

      const all_selected = variants_id.every(id => products.some(product => id === product.id));

      if (all_selected) {
        selectedProducts.value = products.filter(product => !variants_id.some(id => id === product.id));
      } else {
        variants.forEach(variant => {
          const { id: variant_id, images: variant_images, name: variant_name } = variant;

          const selected = products.find(product => product.id === variant_id);

          if (!selected) {
            products.push({
              id      : variant_id,
              images  : variant_images,
              name    : `${name} - ${variant_name}`,
              quantity: 1,
            });
          }
        });
      }
    } else {
      const selected = products.find(product => product.id === id);

      if (selected) {
        const index = products.indexOf(selected);

        products.splice(index, 1)
      } else {
        products.push({ id, images, name, quantity: 1 });
      }
    }
  };

  const handleSelectVariant = (product_name: string, data: ProductListVariant) => {
    const { id, images, name } = data;
    const products = selectedProducts.value;
    const selected = products.find(product => product.id === id);

    if (selected) {
      const index = products.indexOf(selected);

      products.splice(index, 1);
    } else {
      products.push({
        name    : `${product_name} - ${name}`,
        quantity: 1,
        id,
        images,
      });
    }
  };

  const handleRemoveProduct = (index: number) => {
    formData.products.splice(index, 1);
    selectedProducts.value = formData.products;
  };

  const handleDialogOpen = () => {
    selectedProducts.value = [...formData.products];
    loadProducts.value      = true;
  };

  const handleDialogClose = (_e: Event, save?: boolean) => {
    if (save) {
      formData.products = [...selectedProducts.value];
    } else {
      selectedProducts.value = [...formData.products];
    }

    showDialog.value     = false;
    pageProduct.current  = 1;
    pageBundle.current   = 1;
  };

  const handleDialogLeave = () => {
    productListTab.value = 0;
    loadProducts.value   = false;
    loadBundles.value    = false;
  };

  const handleSubmit = () => {
    const errors = [];

    if (formData.name.trim() === '') {
      formError.name = 'Sales name cannot be empty.';
      errors.push('');
    } else {
      formError.name = '';
    }

    if (formData.balance && !isNumeric(formData.balance)) {
      formError.balance = 'Sales balance must be a number.';
      errors.push('');
    } else {
      formError.balance = '';
    }

    if (!formData.products.length) {
      // @ts-ignore
      toast.add({ message: 'No product has been selected', type: 'error' });
      return;
    }

    if (!errors.length) {
      params.id ? mutateEdit() : mutateAdd();
    } else {
      // @ts-ignore
      toast.add({ message: 'There\'s some error on some form input, please check again.', type: 'error' });
    }
  };

  return {
    salesId: params.id,
    productListTab,
    showDialog,
    loadProducts,
    loadBundles,
    searchProductQuery,
    searchBundleQuery,
    formData,
    formError,
    selectedProducts,
    productList: productList as Ref<ProductListNormalizerReturn>,
    bundleList: bundleList as Ref<BundleListNormalizerReturn>,
    isDetailError,
    isDetailLoading,
    isProductListError,
    isProductListLoading,
    isBundleListError,
    isBundleListLoading,
    isMutateAddLoading,
    isMutateEditLoading,
    pageProduct,
    pageBundle,
    handleSearch,
    toPrevPage,
    toNextPage,
    detailRefetch,
    isProductSelected,
    isVariantSelected,
    isBundleSelected,
    handleDialogOpen,
    handleDialogClose,
    handleDialogLeave,
    handleRemoveProduct,
    handleSelectProduct,
    handleSelectVariant,
    handleSelectBundle,
    handleSubmit,
    bundleListRefetch,
    productListRefetch,
    mutateAdd,
  };
};
