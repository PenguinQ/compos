import { computed, inject, ref } from 'vue';
import { useRoute } from 'vue-router';

// Databases
import { getSalesDetail, getSalesProducts, getSalesOrders } from '@/database/query/sales';
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
  price: number;
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
  const totalProductsPrice = computed(() => orderedProducts.value.reduce((acc, product) => acc += (product.amount * product.price), 0));
  const paymentAmountStr = ref('0');
  const paymentAmountInt = computed(() => parseInt(paymentAmountStr.value));
  const paymentAmountChange = computed(() => totalProductsPrice.value > paymentAmountInt.value ? 0 : paymentAmountInt.value - totalProductsPrice.value);

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
      toast.add({ message: 'Failed to get the sales detail,', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the sales detail,', error);
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
    delay: 500,
    enabled: loadProducts,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales products.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the sales products.', error);
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
      console.error('[ERROR] Failed to get the sales orders.', error);
    },
    onSuccess: result => {
      console.log('Orders:', result);
    },
  });

  const {
    mutate: mutateAddOrder,
    isLoading: isMutateAddOrderLoading,
  } = useMutation({
    mutateFn: () => {},
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to add order.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to add orders.', error);
    },
    onSuccess: () => {

    },
  });

  const handleClickCalculator = (digit: string) =>{
    if (paymentAmountStr.value === '0') {
      if (parseInt(digit) !== 0) {
        paymentAmountStr.value = digit;
      }
    } else {
      paymentAmountStr.value += digit;
    }
  };

  const handleClickClear = () => {
    orderedProducts.value = [];
  };

  const handleClickCancel = () => {
    controlsView.value = 'order-default';
    paymentAmountStr.value = '0';
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
    handleClickCalculator,
    handleClickCancel,
    handleClickClear,
  };
};
