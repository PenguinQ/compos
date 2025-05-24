import { computed, reactive, inject, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Big from 'big.js';

// Databases
import { useQuery, useObservableQuery, useMutation } from '@/database/hooks';
import {
  getSaleDetail,
  getSaleProducts,
  getSaleOrders,
  mutateFinishSale,
} from '@/database/query/sale';
import { mutateAddOrder, mutateCancelOrder } from '@/database/query/order';
import { isBundle } from '@/database/utils';

// Helpers
import { cleanWhitespace, debounce } from '@/helpers';

// Normalizers
import {
  dashboardDetailsNormalizer,
  dashboardOrdersNormalizer,
  dashboardProductsNormalizer,
} from '../normalizer/SaleDashboard.normalizer';


type SaleProductDetails = ReturnType<typeof dashboardDetailsNormalizer>['products'];

type SaleProduct = Omit<ReturnType<typeof dashboardProductsNormalizer>['products'][number], 'price'> & {
  price: Big;
  amount: number;
  sortOrder: number;
};

export const useSaleDashboard = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const controlsView          = ref('order-default');
  const detailsProducts       = ref<SaleProductDetails>([]);
  const loadProducts          = ref(false);
  const loadOrders            = ref(false);
  const initialProducts       = ref<SaleProduct[]>([]);
  const products              = ref<SaleProduct[]>([]);
  const searchQuery           = ref('');
  const orderedProducts       = computed(() => initialProducts.value.filter(p => p.amount > 0));
  const sortedOrderedProducts = computed(() => orderedProducts.value.sort((a, b) => a.sortOrder - b.sortOrder));
  const totalProductsCount    = computed(() => orderedProducts.value.reduce((acc, product) => acc += product.amount, 0));
  const totalProductsPrice    = computed(() => orderedProducts.value.reduce((acc, product) => acc.plus(Big(product.price).times(product.amount)), Big(0)));
  const paymentInput          = ref('0');
  const paymentTendered       = computed(() => Big(paymentInput.value));
  const paymentChange         = computed(() => totalProductsPrice.value.gt(paymentTendered.value) ? 0 : paymentTendered.value.minus(totalProductsPrice.value));
  const balance = reactive<{ initial?: string; current?: string; }>({
    initial: undefined,
    current: undefined,
  });
  const orderNote  = ref('');
  const orderNotes = ref<string[]>([]);
  const dialog = reactive({
    cancel : false,
    finish : false,
    history: false,
    payment: false,
  });
  const cancelDetail = reactive({
    id  : '',
    name: '',
  });
  const productsStock = new Map<string, number>();

  const resetProductsAmount = () => {
    for (const product of products.value) {
      product.amount    = 0;
      product.sortOrder = 0;
    }
  };

  const {
    data     : detailsData,
    isError  : isDetailsError,
    isLoading: isDetailsLoading,
    refetch  : detailsRefetch,
  } = useQuery({
    queryKey: ['sale-dashboard-details', params.id],
    queryFn: () => getSaleDetail(params.id as string),
    queryNormalizer: dashboardDetailsNormalizer,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sale detail', type: 'error', duration: 2000 });
      console.error('Failed to get the sale detail,', error.message);

      router.push('/sale');
    },
    onSuccess: response => {
      if (response) {
        const {
          balance   : responseBalance,
          orderNotes: responseOrderNotes,
          finished,
          products,
        } = response;

        if (finished) {
          router.push(`/sale/detail/${params.id}`);
        } else {
          for (const product of products) detailsProducts.value.push(product);

          loadProducts.value = true;
          loadOrders.value   = true;

          if (responseBalance) {
            balance.initial = responseBalance;
            balance.current = responseBalance;
          }

          if (responseOrderNotes) {
            for (const note of responseOrderNotes) orderNotes.value.push(note);
          }
        }
      }
    },
  });

  const {
    isError  : isProductsError,
    isLoading: isProductsLoading,
    refetch  : productsRefetch,
  } = useQuery({
    queryKey: ['sale-dashboard-products', params.id],
    queryFn: () => getSaleProducts(detailsProducts.value),
    queryNormalizer: dashboardProductsNormalizer,
    enabled: loadProducts,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sale products', type: 'error', duration: 2000 });
      console.error('Failed to get the sale products,', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { products: responseProducts } = response;
        const tempProducts = [];

        // Reset the products stock map, and search query
        searchQuery.value = '';
        productsStock.clear();

        for (const product of responseProducts) {
          tempProducts.push({
            ...product,
            amount   : 0,
            sortOrder: 0,
            price    : Big(product.price),
          });

          if (isBundle(product.id)) {
            for (const item of product.items || []) {
              if (!productsStock.has(item.id)) productsStock.set(item.id, item.stock);
            }
          } else {
            if (!productsStock.has(product.id)) {
              productsStock.set(product.id, product.stock);
            }
          }
        }

        initialProducts.value = tempProducts;
        products.value        = tempProducts;
      }
    },
  });

  const {
    data     : ordersData,
    isError  : isOrdersError,
    isLoading: isOrdersLoading,
    refetch  : ordersRefetch,
  } = useObservableQuery({
    queryFn: () => getSaleOrders({
      id  : params.id as string,
      sort: 'desc',
      observe: true,
    }),
    queryNormalizer: dashboardOrdersNormalizer,
    enabled: loadOrders,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sale orders', type: 'error', duration: 2000 });
      console.error('Failed to get the sale orders,', error.message);
    },
    onSuccess: response => {
      if (response) {
        const { ordersTotalChange } = response;

        if (balance.initial) {
          const bigBalance = Big(balance.initial);
          const bigChange  = Big(ordersTotalChange);
          const subtractedBalance = bigBalance.minus(bigChange);

          if (subtractedBalance.gte(0)) {
            balance.current = bigBalance.minus(bigChange).toString();
          }
        }
      }
    },
  });

  const {
    mutate   : mutateAddOrderFn,
    isLoading: isMutateAddOrderLoading,
  } = useMutation({
    mutateFn: () => {
      const mutateProducts = [];

      for (const product of orderedProducts.value) {
        const { amount, id, name, price, items, sku } = product;
        let itemList = [];

        if (items) {
          for (const item of items) {
            const { id, name, price, quantity, sku } = item;

            itemList.push({
              price: price.toString(),
              id,
              name,
              quantity,
              sku,
            });
          }
        }

        mutateProducts.push({
          items: itemList.length ? itemList : undefined,
          price: price.toString(),
          id,
          name,
          amount,
          sku,
        });
      }

      return mutateAddOrder({
        id  : params.id as string,
        data: {
          tendered: paymentTendered.value.toString(),
          change  : paymentChange.value.toString(),
          products: mutateProducts,
          note    : orderNote.value,
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Failed to add order, ${error.message}`, type: 'error', duration: 2000 });
      console.error('Failed to add order,', error.message);
    },
    onSuccess: () => {
      resetProductsAmount();
      paymentInput.value  = '0';
      controlsView.value  = 'order-default';
      orderNote.value     = '';
      dialog.payment      = false;
      dialog.history      = false;

      // Get new products data.
      productsRefetch();

      // @ts-ignore
      toast.add({ message: 'Order added', type: 'success', duration: 2000 });
    },
  });

  const {
    mutate   : mutateCancelOrderFn,
    isLoading: isMutateCancelOrderFnLoading,
  } = useMutation({
    mutateFn: (data) => mutateCancelOrder(data?.id),
    onError: (error, variables) => {
      // @ts-ignore
      toast.add({ message: `Failed to cancel the order ${variables?.name}, ${error.message}`, type: 'error', duration: 2000 });
      console.error(`Failed to cancel the order, ${variables?.name}`, error.message);
    },
    onSuccess: (_, variables) => {
      // @ts-ignore
      toast.add({ message: `Order ${variables?.name} cancelled`, type: 'success', duration: 2000 });

      dialog.cancel = false;
      productsRefetch();
    },
  });

  const {
    mutate   : mutateFinish,
    isLoading: isMutateFinishLoading,
  } = useMutation({
    mutateFn: () => mutateFinishSale(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Failed to finish the sale, ${error.message}`, type: 'error', duration: 2000 });
      console.error('Failed to finish the sale,', error.message);
    },
    onSuccess: response => {
      // @ts-ignore
      toast.add({ message: `Sale ${response} finished`, type: 'success', duration: 2000 });
      router.push(`/sale/detail/${params.id}`);
    },
  });

  const handleSortOrder = (id: string) => {
    const product  = initialProducts.value.find(p => p.id === id);

    if (product) {
      const inOrders = product.amount > 0;

      if (product.sortOrder === 0 && inOrders) {
        const highestOrder = initialProducts.value.reduce((acc, curr) => {
          return curr.sortOrder > acc.sortOrder ? curr : acc;
        }, products.value[0]).sortOrder;

        product.sortOrder = highestOrder + 1;
      } else if (product.sortOrder !== 0 && !inOrders) {
        product.sortOrder = 0;
      }
    }
  };

  const handleClickBackspace = () => {
    paymentInput.value = paymentInput.value.length === 1 ? '0' : paymentInput.value.slice(0, -1);
  };

  const handleClickCalculator = (digit: string) => {
    if (paymentInput.value === '0') {
      if (parseInt(digit) !== 0) {
        paymentInput.value = digit;
      }
    } else {
      paymentInput.value += digit;
    }
  };

  const handleClickClear = () => {
    resetProductsAmount();
    orderNote.value = '';
  };

  const handleClickCancel = () => {
    controlsView.value = 'order-default';
    paymentInput.value = '0';
  };

  const handlePayment = () => {
    if (totalProductsCount.value) {
      if (paymentTendered.value) {
        /**
         * ------------------------------
         * Create a map of product stock.
         * ------------------------------
         */
        const orderProductsAmount = new Map<string, { name: string; amount: number; }>();

        for (const product of orderedProducts.value) {
          const { id, amount, name } = product;

          if (isBundle(id)) {
            for (const item of product.items || []) {
              const { id: itemId, name: itemName } = item;

              if (orderProductsAmount.has(itemId)) {
                orderProductsAmount.set(itemId, {
                  name  : itemName,
                  amount: orderProductsAmount.get(itemId)!.amount + amount,
                });
              } else {
                orderProductsAmount.set(itemId, { name: itemName, amount});
              }
            }
          } else {
            if (!orderProductsAmount.has(id)) {
              orderProductsAmount.set(id, { name, amount });
            }
          }
        }

        /**
         * ------------------------------------------------------------------------------------
         * Looping through ordered product to check if the amount are greater than their stock.
         * ------------------------------------------------------------------------------------
         * If the condition is fullfilled, stop the operation.
         */
        for (const [key, value] of orderProductsAmount.entries()) {
          const { amount, name } = value;
          const stock = productsStock.get(key)!;

          if (amount > stock) {
            // @ts-ignore
            toast.add({ message: `Insufficient stock for ${name}, only ${stock} remaining; You ordered ${amount}`, type: 'error', duration: 5000 });

            return false;
          }
        }

        /**
         * --------------------------------------------------------------------------------------
         * If sale have any balance, do comparison of current order change with current balance.
         * --------------------------------------------------------------------------------------
         */
        if (balance.current) {
          const bigBalance = Big(balance.current);
          const bigChange  = Big(paymentChange.value);

          if (bigChange.gt(bigBalance)) {
            // @ts-ignore
            toast.add({ message: 'Low amount of balance', type: 'error', duration: 2000 });

            return false;
          }
        }

        if (totalProductsPrice.value.gt(paymentTendered.value)) {
          // @ts-ignore
          toast.add({ message: 'Payment amount is less than total price', type: 'error', duration: 2000 });
        } else {
          mutateAddOrderFn();
        }
      } else {
        // @ts-ignore
        toast.add({ message: 'No paymount amount inputted yet', type: 'error', duration: 2000 });
      }
    } else {
      // @ts-ignore
      toast.add({ message: 'No item ordered yet', type: 'error', duration: 2000 });
    }
  };

  const handleShowOrderHistory = () => {
    controlsView.value = controlsView.value !== 'order-history' ? 'order-history' : 'order-default';
  };

  const handleCancelOrder = (id: string, name: string) => {
    cancelDetail.id   = id;
    cancelDetail.name = name;
    dialog.cancel     = true;
  };

  watch(searchQuery, debounce((query: string) => {
    if (query !== '') {
      products.value = initialProducts.value.filter(product => {
        const name         = product.name.toLowerCase();
        const cleanedQuery = cleanWhitespace(query.toLowerCase());

        return name.includes(cleanedQuery);
      });
    } else {
      products.value = initialProducts.value;
    }
  }));

  return {
    saleId: params.id,
    searchQuery,
    detailsData,
    ordersData,
    products,
    orderedProducts,
    sortedOrderedProducts,
    orderNotes,
    orderNote,
    controlsView,
    balance,
    paymentChange,
    paymentTendered,
    paymentInput,
    dialog,
    cancelDetail,
    totalProductsCount,
    totalProductsPrice,
    isDetailsError,
    isDetailsLoading,
    isProductsError,
    isProductsLoading,
    isOrdersError,
    isOrdersLoading,
    isMutateFinishLoading,
    isMutateAddOrderLoading,
    isMutateCancelOrderFnLoading,
    handleCancelOrder,
    handleClickBackspace,
    handleClickCalculator,
    handleClickCancel,
    handleClickClear,
    handlePayment,
    handleShowOrderHistory,
    handleSortOrder,
    detailsRefetch,
    productsRefetch,
    ordersRefetch,
    mutateFinish,
    mutateCancelOrderFn,
  };
};
