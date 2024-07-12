import { computed, inject, reactive, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute, useRouter } from "vue-router";

// Databases
import { useQuery, useMutation } from '@/database/hooks';
import { getSalesDetail, mutateAddSales } from '@/database/query/sales';
import { getProductList } from '@/database/query/product';

// Normalizers
import { salesFormListNormalizer, salesFormNormalizer } from '../normalizer/SalesForm.normalizer';
import type { ListVariant, ListProduct, ListNormalizerReturn, FormNormalizerReturn } from '../normalizer/SalesForm.normalizer';

// Helpers
import { debounce } from '@/helpers';

type FormDataProduct = {
  id: string;
  name: string;
  image: string;
};

type FormData = {
  id: string;
  name: string;
  products: FormDataProduct[];
};

export const useSalesForm = () => {
  const route = useRoute();
  const router = useRouter();
  const toast = inject('ToastProvider');
  const { params } = route;
  const search_query = ref('');
  const load_products = ref(false);
  const show_products_dialog = ref(false);
  const selected_products = ref<FormDataProduct[]>([]);
  const form_data = reactive<FormData>({
    id: '',
    name: '',
    products: [],
  });
  const form_error = reactive({
    name: '',
    product: '',
  });
  const page = reactive({
    current: 1,
    total: 1,
    limit: 12,
    first: true,
    last: true,
  });
  const current_page = computed(() => page.current);

  /**
   * -----------------------
   * Get sales form details.
   * -----------------------
   * Get sales form details if id from url params is exist.
   *
   * Run on route(s):
   * - /sales/detail/:id
   */
  const {
    refetch: salesDetailRefetch,
    isError: salesDetailError,
    isLoading: salesDetailLoading,
  } = useQuery({
    enabled: params.id ? true : false,
    queryKey: ['sales-form-details', params.id],
    queryFn: () => getSalesDetail({
      id: params.id as string,
      normalizer: salesFormNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting sales detail, ${error}`, type: 'error' });
      console.error('[ERROR] Error getting sales detail.', error);
    },
    onSuccess: response => {
      const { name, products } = response as FormNormalizerReturn;

      form_data.name = name;
      form_data.products  = products;
    },
  });

  /**
   * ----------------------------
   * Get sales form product list.
   * ----------------------------
   * Get sales form details list of available products.
   *
   * Run on route(s):
   * - /sales/add
   * - /sales/detail/:id
   */
  const {
    data: product_list,
    refetch: productListRefetch,
    isLoading: productListLoading,
    isError: productListError,
  } = useQuery({
    enabled: load_products,
    queryKey: ['sales-form-products', search_query, current_page],
    queryFn: () => getProductList({
      active: true,
      search_query: search_query.value,
      sort: 'desc',
      complete: true,
      limit: page.limit,
      page: page.current,
      normalizer: salesFormListNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error getting product list, ${error}`, type: 'error' });
      console.error('[ERROR] Error getting product list.', error);
    },
    onSuccess: response => {
      if (response) {
        const { page: response_page } = response as ListNormalizerReturn;

        page.total = response_page.total;
        page.first = response_page.first;
        page.last = response_page.last;
      }
    },
  });

  /**
   * --------------
   * Add new sales.
   * --------------
   * Run on route(s):
   * - /sales/add
   */
  const {
    mutate: mutateAdd,
    isLoading: mutateAddLoading,
  } = useMutation({
    mutateFn: () => {
      const product_ids: string[] = [];

      form_data.products.forEach(product => product_ids.push(product.id));

      return mutateAddSales({
        data: {
          name: form_data.name,
          products: product_ids,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Error adding new sales, ${error}`, type: 'error' });
      console.error('[ERROR] Error adding new sales.', error);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Sales added.', type: 'success', duration: 2000 });
      router.back();
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;

    page.current = 1;
    search_query.value = target.value;
  });

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

  const isProductSelected = (data: ListProduct) => {
    const { id, variant: variants } = data;
    const products = selected_products.value;

    if (variants.length) {
      const variants_id: string[] = [];

      variants.forEach(variant => variants_id.push(variant.id));

      return variants_id.every(id => products.some(product => id === product.id));
    }

    return products.find(product => product.id === id);
  };

  const isVariantSelected = (id: string) => {
    return selected_products.value.find(product => product.id === id);;
  };

  const handleSelectProduct = (data: ListProduct) => {
    const { id, image, name, variant: variants } = data;
    const products = selected_products.value;

    if (variants.length) {
      const variants_id: string[] = [];

      variants.forEach(variant => variants_id.push(variant.id));

      const all_selected = variants_id.every(id => products.some(product => id === product.id));

      if (all_selected) {
        selected_products.value = products.filter(product => !variants_id.some(id => id === product.id));
      } else {
        variants.forEach(variant => {
          const { id: variant_id, image: variant_image, name: variant_name } = variant;

          const selected = products.find(product => product.id === variant_id);

          if (!selected) {
            products.push({
              id: variant_id,
              image: variant_image,
              name: `${name} - ${variant_name}`,
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
        products.push({ id, image, name });
      }
    }
  };

  const handleSelectVariant = (product_name: string, data: ListVariant) => {
    const { id, image, name } = data;
    const products = selected_products.value;
    const selected = products.find(product => product.id === id);

    if (selected) {
      const index = products.indexOf(selected);

      products.splice(index, 1);
    } else {
      products.push({ id, image, name: `${product_name} - ${name}` });
    }
  };

  const handleRemoveProduct = (index: number) => {
    form_data.products.splice(index, 1);
    selected_products.value = form_data.products;
  };

  const handleDialogOpen = () => {
    selected_products.value = [...form_data.products];
    load_products.value = true;
  };

  const handleDialogClose = (_e: Event, save?: boolean) => {
    if (save) {
      form_data.products = [...selected_products.value];
    } else {
      selected_products.value = [...form_data.products];
    }

    show_products_dialog.value = false;
    page.current = 1;
  };

  const handleSubmit = () => {
    const errors = [];

    if (form_data.name.trim() === '') {
      form_error.name = 'Sales name cannot be empty.';
      errors.push('');
    } else {
      form_error.name = '';
    }

    if (!form_data.products.length) {
      // @ts-ignore
      toast.add({ message: 'No product has been selected', type: 'error' });
      return;
    }

    if (!errors.length) {
      params.id ? false : mutateAdd();
    } else {
      // @ts-ignore
      toast.add({ message: 'There\'s some error on some form input, please check again.', type: 'error' });
    }
  };

  return {
    sales_id: params.id,
    product_list: product_list as Ref<ListNormalizerReturn>,
    page,
    form_data,
    form_error,
    load_products,
    show_products_dialog,
    search_query,
    selected_products,
    salesDetailError,
    salesDetailLoading,
    salesDetailRefetch,
    isProductSelected,
    isVariantSelected,
    handleDialogClose,
    handleDialogOpen,
    handleRemoveProduct,
    handleSearch,
    handleSelectProduct,
    handleSelectVariant,
    handleSubmit,
    productListError,
    productListLoading,
    productListRefetch,
    toPrevPage,
    toNextPage,
    mutateAdd,
    mutateAddLoading,
  };
};
