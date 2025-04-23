import { computed, inject, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getSaleFormDetail, mutateAddSale, mutateEditSale } from '@/database/query/sale';
import { getProductList } from '@/database/query/product';
import { getBundleList } from '@/database/query/bundle';

// Normalizers
import {
  saleFormDetailNormalizer,
  saleFormProductListNormalizer,
  saleFormBundleListNormalizer,
} from '../normalizer/SaleForm.normalizer';

// Helpers
import { debounce, isNumericString } from '@/helpers';

type FormBundle  = ReturnType<typeof saleFormBundleListNormalizer>['bundles'][number];
type FormProduct = ReturnType<typeof saleFormProductListNormalizer>['products'][number];
type FormVariant = FormProduct['variants'][number];

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
  orderNotes: string[];
};

export const useSaleForm = () => {
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
    id        : '',
    name      : '',
    balance   : '',
    products  : [],
    orderNotes: [''],
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
  const currentPageProduct = computed(() => pageProduct.current);
  const currentPageBundle  = computed(() => pageBundle.current);

  const handleAddNote = () => {
    formData.orderNotes.push('');
  };

  const handleRemoveNote = (index: number) => {
    if (formData.orderNotes.length > 1) formData.orderNotes.splice(index, 1);
  };

  const {
    data     : saleDetail,
    refetch  : detailRefetch,
    isError  : isDetailError,
    isLoading: isDetailLoading,
  } = useQuery({
    enabled: params.id ? true : false,
    queryKey: ['sale-form-details', params.id],
    queryFn: () => getSaleFormDetail(params.id as string),
    queryNormalizer: saleFormDetailNormalizer,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting sale detail', type: 'error' });
      console.error('Error getting sale detail,', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { name, balance, orderNotes, products } = response;

        formData.name       = name;
        formData.products   = products;
        formData.orderNotes = orderNotes.length ? [...orderNotes] : [''];
        if (balance) formData.balance = balance;
      }
    },
  });

  const {
    data     : productList,
    isError  : isProductListError,
    isLoading: isProductListLoading,
    refetch  : productListRefetch,
  } = useQuery({
    enabled : loadProducts,
    queryKey: ['sale-form-products', searchProductQuery, currentPageProduct],
    queryFn : () => getProductList({
      active      : true,
      search_query: searchProductQuery.value,
      sort        : 'desc',
      complete    : true,
      limit       : pageProduct.limit,
      page        : pageProduct.current,
    }),
    queryNormalizer: saleFormProductListNormalizer,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting product list', type: 'error' });
      console.error('Error getting product list,', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { page: responsePage } = response;

        pageProduct.total = responsePage.total;
        pageProduct.first = responsePage.first;
        pageProduct.last  = responsePage.last;
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
    queryKey: ['sale-form-bundles', searchBundleQuery, currentPageBundle],
    queryFn : () => getBundleList({
      active      : true,
      search_query: searchBundleQuery.value,
      sort        : 'desc',
      limit       : pageBundle.limit,
      page        : pageBundle.current,
    }),
    queryNormalizer: saleFormBundleListNormalizer,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error getting product list', type: 'error' });
      console.error('Error getting product list,', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { page: responsePage } = response;

        pageBundle.total = responsePage.total;
        pageBundle.first = responsePage.first;
        pageBundle.last  = responsePage.last;
      }
    },
  })

  const {
    mutate   : mutateAdd,
    isLoading: isMutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const productsData: { id: string; quantity: number; }[] = [];

      for (const product of formData.products) {
        productsData.push({ id: product.id, quantity: product.quantity });
      }

      return mutateAddSale({
        data: {
          name    : formData.name,
          balance : formData.balance,
          products: productsData,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error adding new sale', type: 'error' });
      console.error('Error adding new sale,', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Sale added.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const {
    mutate   : mutateEdit,
    isLoading: isMutateEditLoading,
  } = useMutation({
    mutateFn: async () => {
      const productsData: { id: string; quantity: number; }[] = [];

      for (const product of formData.products) {
        productsData.push({ id: product.id, quantity: product.quantity });
      }

      return mutateEditSale({
        id  : params.id as string,
        data: {
          name       : formData.name,
          balance    : formData.balance,
          products   : productsData,
          order_notes: formData.orderNotes.filter(note => note !== ''),
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Error updating sale', type: 'error' });
      console.error('Error updating sale,', error.message);
    },
    onSuccess: (response) => {
      // @ts-ignore
      toast.add({ message: `Sale ${response} updated.`, type: 'success', duration: 2000 });
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

  const isBundleSelected = (data: FormBundle) => {
    const { id } = data;
    const products = selectedProducts.value;

    return products.find(product => product.id === id);
  };

  const isProductSelected = (data: FormProduct) => {
    const { id, variants: variants } = data;
    const products = selectedProducts.value;

    if (variants.length) {
      const variantIds: string[] = [];

      variants.forEach(variant => variantIds.push(variant.id));

      return variantIds.every(id => products.some(product => id === product.id));
    }

    return products.find(product => product.id === id);
  };

  const isVariantSelected = (id: string) => {
    return selectedProducts.value.find(product => product.id === id);;
  };

  const handleSelectBundle = (data: FormBundle) => {
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

  const handleSelectProduct = (data: FormProduct) => {
    const { id, images, name, variants: variants } = data;
    const products = selectedProducts.value;

    if (variants.length) {
      const variantIds: string[] = [];

      variants.forEach(variant => variantIds.push(variant.id));

      const allSelected = variantIds.every(id => products.some(product => id === product.id));

      if (allSelected) {
        selectedProducts.value = products.filter(product => !variantIds.some(id => id === product.id));
      } else {
        variants.forEach(variant => {
          const { id: variantId, images: variantImages, name: variantName } = variant;

          const selected = products.find(product => product.id === variantId);

          if (!selected) {
            products.push({
              id      : variantId,
              images  : variantImages,
              name    : `${name} - ${variantName}`,
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

  const handleSelectVariant = (productName: string, data: FormVariant) => {
    const { id, images, name } = data;
    const products = selectedProducts.value;
    const selected = products.find(product => product.id === id);

    if (selected) {
      const index = products.indexOf(selected);

      products.splice(index, 1);
    } else {
      products.push({
        name    : `${productName} - ${name}`,
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
      formError.name = 'Sale name cannot be empty.';
      errors.push('');
    } else {
      formError.name = '';
    }

    if (formData.balance && !isNumericString(formData.balance)) {
      formError.balance = 'Sale balance must be a number.';
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
      toast.add({ message: 'There\'s some error on some form input, please check again', type: 'error' });
    }
  };

  const handleRefresh = async (e: any) => {
    // Reset any possible dynamic fields
    formData.name     = '';
    formData.balance  = '';
    formData.products = [];
    formError.name    = '';
    formError.product = '';
    formError.balance = '';

    await detailRefetch();
    e.complete();
  };

  const handleRefreshList = async (e: any) => {
    const resetTabPage = async (index: number) => {
      if (index === 0) {
        loadProducts.value  = false;
        pageProduct.current = 1;
        pageProduct.first   = true;
        pageProduct.last    = true;
        loadProducts.value  = true;
      } else if (index === 1) {
        loadBundles.value  = false;
        pageBundle.current = 1;
        pageBundle.first   = true;
        pageBundle.last    = true;
        loadBundles.value  = true;
      }
    };

    await resetTabPage(productListTab.value);

    if (productListTab.value === 0) {
      await productListRefetch();
    } else if (productListTab.value === 1) {
      await bundleListRefetch();
    }

    e.complete();
  };

  return {
    saleId: params.id,
    saleDetail,
    productList,
    bundleList,
    productListTab,
    showDialog,
    loadProducts,
    loadBundles,
    searchProductQuery,
    searchBundleQuery,
    formData,
    formError,
    selectedProducts,
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
    handleRefresh,
    handleRefreshList,
    bundleListRefetch,
    productListRefetch,
    mutateAdd,
    handleAddNote,
    handleRemoveNote,
  };
};
