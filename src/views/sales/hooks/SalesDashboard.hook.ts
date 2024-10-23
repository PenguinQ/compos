import { computed, inject, ref } from 'vue';
import { useRoute } from 'vue-router';
import Big from 'big.js';

// Databases
import { getSalesDetail, getSalesProducts, getSalesOrders } from '@/database/query/sales';
import { mutateAddOrder, mutateDeleteOrder } from '@/database/query/order';
import { useQuery, useObservableQuery, useMutation } from '@/database/hooks';

// Normalizers
import {
  detailsNormalizer,
  productsNormalizer,
  ordersNormalizer,
} from '../normalizer/SalesDashboard.normalizer';

type OrderProducts = {
  amount: number;
  id: string;
  image: string;
  name: string;
  price: string;
  quantity: number;
  stock: number;
};

export const useSalesDashboard = () => {
  const route = useRoute();
  const { params } = route;
  const toast = inject('ToastProvider');
  const controlsView = ref('order-default');
  const detailsProducts = ref([]);
  const loadProducts = ref(false);
  const loadOrders = ref(false);
  const orderedProducts = ref<OrderProducts[]>([]);
  const totalProductsCount = computed(() => orderedProducts.value.reduce((acc, product) => acc += product.amount, 0));
  const totalProductsPrice = computed(() => orderedProducts.value.reduce((acc, product) => acc.plus(Big(product.price).times(product.amount)), Big(0)))
  const paymentAmountStr = ref('0');
  const paymentAmountInt = computed(() => Big(paymentAmountStr.value));
  const paymentAmountChange = computed(() => totalProductsPrice.value.gt(paymentAmountInt.value) ? 0 : paymentAmountInt.value.minus(totalProductsPrice.value));
  // KEEP
  // const totalProductsPrice = computed(() => orderedProducts.value.reduce((acc, product) => acc += (product.amount * product.price), 0));
  // const paymentAmountInt = computed(() => parseInt(paymentAmountStr.value));
  // const paymentAmountChange = computed(() => totalProductsPrice.value > paymentAmountInt.value ? 0 : paymentAmountInt.value - totalProductsPrice.value);

  const {
    data: detailsData,
    isError: isDetailsError,
    isLoading: isDetailsLoading,
  } = useQuery({
    queryKey: ['sales-dashboard-details', params.id],
    queryFn: () => getSalesDetail({
      id: params.id as string,
      normalizer: detailsNormalizer,
    }),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales detail.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the sales detail.', error.message);
    },
    onSuccess: async (result) => {
      const { products: productsResult } = result;

      for await (const product of productsResult) detailsProducts.value.push(product);

      loadProducts.value = true;
      loadOrders.value = true;
    },
  });

  const {
    data: productsData,
    isError: isProductsError,
    isLoading: isProductsLoading,
  } = useObservableQuery({
    queryKey: ['sales-dashboard-products', params.id],
    queryFn: () => getSalesProducts({
      products: detailsProducts.value,
      normalizer: productsNormalizer,
    }),
    enabled: loadProducts,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales products.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the sales products.', error.message);
    },
    onSuccess: result => {
      console.log('Products:', result);
    },
  });

  const {
    data: ordersData,
    isError: isOrdersError,
    isLoading: isOrdersLoading,
  } = useObservableQuery({
    queryKey: ['sales-dashboard-orders', params.id],
    queryFn: () => getSalesOrders({
      id: params.id as string,
      normalizer: ordersNormalizer,
    }),
    enabled: loadOrders,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales orders.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the sales orders.', error.message);
    },
    onSuccess: result => {
      console.log('Orders:', result);
    },
  });

  const {
    mutate: mutateAddOrderFn,
    isLoading: isMutateAddOrderLoading,
  } = useMutation({
    mutateFn: () => {
      const productsData = [];

      for (const order of orderedProducts.value) {
        const { amount, id, name, price } = order;

        productsData.push({
          id,
          name,
          price,
          amount,
        });
      }

      return mutateAddOrder({
        id: params.id as string,
        data: productsData,
      });
    },
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to add order.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to add order.', error.message);
    },
    onSuccess: () => {
      orderedProducts.value = [];
      paymentAmountStr.value = '0';
      controlsView.value = 'order-default';

      // @ts-ignore
      toast.add({ message: 'Order added.', type: 'success', duration: 2000 });
    },
  });

  const {
    mutate: mutateDeleteOrderFn,
    isLoading: isMutateDeleteOrderLoading,
  } = useMutation({
    mutateFn: () => mutateDeleteOrder(),
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to delete order.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to delete order.', error.message);
    },
    onSuccess: () => {
      // @ts-ignore
      toast.add({ message: 'Order deleted.', type: 'success', duration: 2000 });
    },
  });

  const handleClickIncrement = (product: any) => {
    const { id, image, name, stock, price, quantity } = product;
    const order = orderedProducts.value.find(product => product.id === id);

    if (order) {
      if (order.amount < stock) order.amount += quantity;
    } else {
      orderedProducts.value.push({
        id,
        image,
        name,
        price,
        stock,
        amount: quantity,
        quantity,
      });
    }
  };

  const handleClickDecrement = (product: any) => {
    const { id, quantity } = product;
    const order = orderedProducts.value.find(product => product.id === id);

    if (order) {
      if (order.amount > 1) {
        order.amount -= quantity;
      } else {
        const filtered = orderedProducts.value.filter(product => product.id !== id);

        orderedProducts.value = filtered;
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
    // console.log(digit);
    paymentAmountStr.value += digit;

    // if (paymentAmountStr.value === '0') {
    //   if (parseInt(digit) !== 0) {
    //     paymentAmountStr.value = digit;
    //   }
    // } else {
    //   paymentAmountStr.value += digit;
    // }

    console.log(paymentAmountStr.value);
  };

  const handleClickClear = () => {
    orderedProducts.value = [];
  };

  const handleClickCancel = () => {
    controlsView.value = 'order-default';
    paymentAmountStr.value = '0';
  };

  const handlePayment = () => {
    if (totalProductsCount.value) {
      if (paymentAmountInt.value) {
        if (totalProductsPrice.value > paymentAmountInt.value) {
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

  return {
    salesId: params.id,
    controlsView,
    detailsData,
    productsData,
    ordersData,
    orderedProducts,
    paymentAmountChange,
    paymentAmountInt,
    paymentAmountStr,
    totalProductsCount,
    totalProductsPrice,
    isDetailsError,
    isDetailsLoading,
    isProductsError,
    isProductsLoading,
    isOrdersError,
    isOrdersLoading,
    isMutateAddOrderLoading,
    isMutateDeleteOrderLoading,
    handleClickDecrement,
    handleClickIncrement,
    handleClickQuantityDecrement,
    handleClickCalculator,
    handleClickCancel,
    handleClickClear,
    handlePayment,
  };
};
