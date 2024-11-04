import { computed, reactive, inject, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Big from 'big.js';
import type { Ref } from 'vue';

// Databases
import { useQuery, useObservableQuery, useMutation } from '@/database/hooks';
import {
  getSalesDetail,
  getSalesProducts,
  getSalesOrders,
  mutateFinishSales,
} from '@/database/query/sales';
import { mutateAddOrder } from '@/database/query/order';
import { isBundle } from '@/database/utils';

// Normalizers
import {
  detailsNormalizer,
  productsNormalizer,
  ordersNormalizer,
} from '../normalizer/SalesDashboard.normalizer';
import type {
  DetailsNormalizerReturn,
  DetailsNormalizerProduct,
  ProductsNormalizerReturn,
  ProductsNormalizerProduct,
  OrdersNormalizerReturn,
} from '../normalizer/SalesDashboard.normalizer';

type OrderedProductBundleItem = {
  id: string;
  name: string;
  quantity: number;
  stock: number;
  price: Big;
  sku?: string;
};

/**
 * ---------------------------------------------------------------------------------------------
 * 1. stock is optional, since the product can be a bundle, and bundle items has it's own stock.
 * 2. items is optional, since items only for bundle.
 * ---------------------------------------------------------------------------------------------
 */
type OrderedProduct = {
  id: string;
  images: string[];
  name: string;
  price: Big;
  amount: number;
  quantity: number;
  stock?: number;
  items?: OrderedProductBundleItem[];
  sku?: string;
};

export const useSalesDashboard = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const dialogFinish       = ref(false);
  const controlsView       = ref('order-default');
  const detailsProducts    = ref<DetailsNormalizerProduct[]>([]);
  const loadProducts       = ref(false);
  const loadOrders         = ref(false);
  const orderedProducts    = ref<OrderedProduct[]>([]);
  const totalProductsCount = computed(() => orderedProducts.value.reduce((acc, product) => acc += product.amount, 0));
  const totalProductsPrice = computed(() => orderedProducts.value.reduce((acc, product) => acc.plus(Big(product.price).times(product.amount)), Big(0)));
  const paymentInput       = ref('0');
  const paymentTendered    = computed(() => Big(paymentInput.value));
  const paymentChange      = computed(() => totalProductsPrice.value.gt(paymentTendered.value) ? 0 : paymentTendered.value.minus(totalProductsPrice.value));
  const balance            = reactive<{ initial?: string; current?: string; }>({
    initial: undefined,
    current: undefined,
  });

  const {
    data     : detailsData,
    isError  : isDetailsError,
    isLoading: isDetailsLoading,
  } = useQuery({
    queryKey: ['sales-dashboard-details', params.id],
    queryFn: () => getSalesDetail({
      id        : params.id as string,
      normalizer: detailsNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales detail.', type: 'error', duration: 2000 });
      console.error('Failed to get the sales detail.', error.message);

      router.push('/sales');
    },
    onSuccess: response => {
      const { finished, balance: detailsBalance, products } = response as DetailsNormalizerReturn;

      if (finished) {
        router.push(`/sales/detail/${params.id}`);
      } else {
        for (const product of products) detailsProducts.value.push(product);

        loadProducts.value = true;
        loadOrders.value   = true;

        if (detailsBalance) {
          balance.initial = detailsBalance;
          balance.current = detailsBalance;
        }
      }
    },
  });

  const {
    data     : productsData,
    isError  : isProductsError,
    isLoading: isProductsLoading,
    refetch  : productsRefetch,
  } = useObservableQuery({
    queryFn: () => getSalesProducts({
      products  : detailsProducts.value,
      normalizer: productsNormalizer,
    }),
    enabled: loadProducts,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales products.', type: 'error', duration: 2000 });
      console.error('Failed to get the sales products.', error.message);
    },
  });

  const {
    data     : ordersData,
    isError  : isOrdersError,
    isLoading: isOrdersLoading,
    refetch  : ordersRefetch,
  } = useObservableQuery({
    queryFn: () => getSalesOrders({
      id        : params.id as string,
      sort      : 'desc',
      normalizer: ordersNormalizer,
    }),
    enabled: loadOrders,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales orders.', type: 'error', duration: 2000 });
      console.error('Failed to get the sales orders.', error.message);
    },
    onSuccess: response => {
      const { ordersTotalChange } = response as OrdersNormalizerReturn;

      if (balance.initial) {
        const bigBalance = Big(balance.initial);
        const bigChange  = Big(ordersTotalChange);
        const subtractedBalance = bigBalance.minus(bigChange);

        if (subtractedBalance.gte(0)) {
          balance.current = bigBalance.minus(bigChange).toString();
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

      for (const order of orderedProducts.value) {
        const { amount, id, name, price, items, sku } = order;
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
        },
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Failed to add order. ${error.message}`, type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to add order.', error.message);
    },
    onSuccess: () => {
      orderedProducts.value = [];
      paymentInput.value    = '0';
      controlsView.value    = 'order-default';

      // @ts-ignore
      toast.add({ message: 'Order added.', type: 'success', duration: 2000 });
    },
  });

  const {
    mutate   : mutateFinish,
    isLoading: isMutateFinishLoading,
  } = useMutation({
    mutateFn: () => mutateFinishSales(params.id as string),
    onError: error => {
      // @ts-ignore
      toast.add({ message: `Failed to finish the sales. ${error.message}`, type: 'error', duration: 2000 });
      console.error('Failed to finish the sales.', error.message);
    },
    onSuccess: response => {
      // @ts-ignore
      toast.add({ message: `Sales ${response} finished.`, type: 'success', duration: 2000 });
      router.push(`/sales/detail/${params.id}`);
    },
  });

  const handleClickIncrement = (product: ProductsNormalizerProduct) => {
    const {
      id,
      images,
      name,
      items,
      stock,
      price,
      quantity,
      sku,
    } = product;
    const order = orderedProducts.value.find(product => product.id === id);

    if (order) {
      const orderAmount = order.amount + quantity!;

      if (orderAmount > stock!) {
        // @ts-ignore
        toast.add({ message: `Insufficient stock for ${name}, only ${stock} remaining. You ordered ${orderAmount}.`, type: 'error', duration: 2000 });
      } else {
        order.amount += quantity!;
      }
    } else {
      const bundle_items = [];

      if (items) {
        for (const item of items) {
          const { id, name, price, quantity, stock, sku } = item;

          bundle_items.push({
            price: Big(price),
            id,
            name,
            quantity,
            stock,
            sku,
          });
        }
      }

      orderedProducts.value.push({
        amount: quantity ? quantity : 1,
        items : bundle_items.length ? bundle_items : undefined,
        price : Big(price),
        id,
        images,
        name,
        stock,
        quantity,
        sku,
      });
    }
  };

  const handleClickDecrement = (product: ProductsNormalizerProduct) => {
    const { id, quantity } = product;
    const order = orderedProducts.value.find(product => product.id === id);

    const removeOrder = () => {
      const filtered = orderedProducts.value.filter(product => product.id !== id);

      orderedProducts.value = filtered;
    };

    if (order) {
      if (order.amount > 1) {
        order.amount -= quantity ? quantity : 1;

        if (!order.amount || order.amount < 0) removeOrder();
      } else {
        removeOrder();
      }
    }
  };

  const handleClickQuantityDecrement = (value: string, id: string) => {
    const intValue = parseInt(value);

    if (!intValue) {
      const filtered = orderedProducts.value.filter(product => product.id !== id);

      orderedProducts.value = filtered;
    }
  };

  const handleClickCalculator = (digit: string) =>{
    if (paymentInput.value === '0') {
      if (parseInt(digit) !== 0) {
        paymentInput.value = digit;
      }
    } else {
      paymentInput.value += digit;
    }
  };

  const handleClickClear = () => {
    orderedProducts.value = [];
  };

  const handleClickCancel = () => {
    controlsView.value = 'order-default';
    paymentInput.value = '0';
  };

  const handlePayment = () => {
    if (totalProductsCount.value) {
      if (paymentTendered.value) {
        /**
         * -------------------------------------------------------------------
         * Create a temporary list of product for amount and stock comparison.
         * -------------------------------------------------------------------
         */
        const tempList = <{ id: string; name: string; amount: number; stock: number; }[]>[];

        for (const product of orderedProducts.value) {
          const { id, name, items, amount, stock } = product;

          if (isBundle(id)) {
            for (const item of items!) {
              const {
                id      : item_id,
                name    : item_name,
                quantity: item_quantity,
                stock   : item_stock,
              } = item;
              const inTempList = tempList.find(product => product.id === item_id);

              if (inTempList) {
                const index = tempList.indexOf(inTempList);

                tempList[index].amount += item_quantity;
              } else {
                tempList.push({
                  id    : item_id,
                  name  : item_name,
                  amount: item_quantity * amount,
                  stock : item_stock,
                });
              }
            }
          } else {
            const inTempList = tempList.find(product => product.id === id);

            if (inTempList) {
              const index = tempList.indexOf(inTempList);

              tempList[index].amount += amount;
            } else {
              tempList.push({ id, name, amount, stock: stock! });
            }
          }
        }

        /**
         * -----------------------------------------------------------------------------------------
         * Check if any of the products inside the temporary list has amount greater than the stock.
         * -----------------------------------------------------------------------------------------
         * If one of the product amount is greater than the stock, stop the operation and show toaster.
         */
        for (const product of tempList) {
          const { name, amount, stock } = product;

          if (amount > stock) {
            // @ts-ignore
            toast.add({ message: `Insufficient stock for ${name}, only ${stock} remaining. You ordered ${amount}.`, type: 'error', duration: 5000 });

            return false;
          }
        }

        /**
         * --------------------------------------------------------------------------------------
         * If sales have any balance, do comparison of current order change with current balance.
         * --------------------------------------------------------------------------------------
         */
        if (balance.current) {
          const bigBalance = Big(balance.current);
          const bigChange  = Big(paymentChange.value);

          if (bigChange.gt(bigBalance)) {
            // @ts-ignore
            toast.add({ message: 'Low amount of balance.', type: 'error', duration: 2000 });

            return false;
          }
        }

        if (totalProductsPrice.value.gt(paymentTendered.value)) {
          // @ts-ignore
          toast.add({ message: 'Payment amount is less than total price.', type: 'error', duration: 2000 });
        } else {
          mutateAddOrderFn();
        }
      } else {
        // @ts-ignore
        toast.add({ message: 'No paymount amount inputted yet.', type: 'error', duration: 2000 });
      }
    } else {
      // @ts-ignore
      toast.add({ message: 'No item ordered yet.', type: 'error', duration: 2000 });
    }
  };

  const handleShowOrderHistory = () => {
    controlsView.value = controlsView.value !== 'order-history' ? 'order-history' : 'order-default';
  };

  return {
    salesId     : params.id,
    detailsData : detailsData as Ref<DetailsNormalizerReturn>,
    productsData: productsData as Ref<ProductsNormalizerReturn>,
    ordersData  : ordersData as Ref<OrdersNormalizerReturn>,
    dialogFinish,
    controlsView,
    orderedProducts,
    balance,
    paymentChange,
    paymentTendered,
    paymentInput,
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
    handleClickDecrement,
    handleClickIncrement,
    handleClickQuantityDecrement,
    handleClickCalculator,
    handleClickCancel,
    handleClickClear,
    handlePayment,
    handleShowOrderHistory,
    productsRefetch,
    ordersRefetch,
    mutateFinish,
  };
};
