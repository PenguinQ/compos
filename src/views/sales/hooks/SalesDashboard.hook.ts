import { computed, inject, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Big from 'big.js';

// Databases
import { getSalesDetail, getSalesProducts, getSalesOrders } from '@/database/query/sales';
import { mutateAddOrder, mutateDeleteOrder } from '@/database/query/order';
import { useQuery, useObservableQuery, useMutation } from '@/database/hooks';

// Normalizers
import { detailsNormalizer, productsNormalizer, ordersNormalizer } from '../normalizer/SalesDashboard.normalizer';
import type {
  DetailsNormalizerReturn,
  DetailsNormalizerProduct,
  ProductsNormalizerReturn,
  OrdersNormalizerReturn,
} from '../normalizer/SalesDashboard.normalizer';
import { isBundle } from '@/database/utils';

type OrderProductBundleItem = {
  id: string;
  name: string;
  quantity: number;
};

type OrderProducts = {
  amount: number;
  id: string;
  image: string;
  name: string;
  price: string;
  items?: OrderProductBundleItem[];
  quantity: number;
  stock: number;
};

export const useSalesDashboard = () => {
  const toast  = inject('ToastProvider');
  const route  = useRoute();
  const router = useRouter();
  const { params } = route;
  const controlsView       = ref('order-default');
  const detailsProducts    = ref<DetailsNormalizerProduct[]>([]);
  const loadProducts       = ref(false);
  const loadOrders         = ref(false);
  const orderedProducts    = ref<OrderProducts[]>([]);
  const totalProductsCount = computed(() => orderedProducts.value.reduce((acc, product) => acc += product.amount, 0));
  const totalProductsPrice = computed(() => orderedProducts.value.reduce((acc, product) => acc.plus(Big(product.price).times(product.amount)), Big(0)));
  const paymentInput       = ref('0');
  const paymentTendered    = computed(() => Big(paymentInput.value));
  const paymentChange      = computed(() => totalProductsPrice.value.gt(paymentTendered.value) ? 0 : paymentTendered.value.minus(totalProductsPrice.value));

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
      console.error('[ERROR] Failed to get the sales detail.', error.message);

      router.push('/sales');
    },
    onSuccess: async (response) => {
      const { products } = response as DetailsNormalizerReturn;

      for (const product of products) detailsProducts.value.push(product);

      loadProducts.value = true;
      loadOrders.value   = true;
    },
  });

  const {
    data     : productsData,
    isError  : isProductsError,
    isLoading: isProductsLoading,
  } = useObservableQuery({
    queryKey: ['sales-dashboard-products', params.id],
    queryFn: () => getSalesProducts({
      products  : detailsProducts.value,
      normalizer: productsNormalizer,
    }),
    enabled: loadProducts,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales products.', type: 'error', duration: 2000 });
      console.error('[ERROR] Failed to get the sales products.', error.message);
    },
  });

  const {
    data     : ordersData,
    isError  : isOrdersError,
    isLoading: isOrdersLoading,
  } = useObservableQuery({
    queryKey: ['sales-dashboard-orders', params.id],
    queryFn: () => getSalesOrders({
      id        : params.id as string,
      normalizer: ordersNormalizer,
    }),
    enabled: loadOrders,
    onError: error => {
      // @ts-ignore
      toast.add({ message: 'Failed to get the sales orders.', type: 'error', duration: 2000 });
      console.error('Failed to get the sales orders.', error.message);
    },
    onSuccess: response => {
      console.log(response);
    },
  });

  const {
    mutate   : mutateAddOrderFn,
    isLoading: isMutateAddOrderLoading,
  } = useMutation({
    mutateFn: () => {
      const mutateProducts = [];

      for (const order of orderedProducts.value) {
        const { amount, id, name, price, items } = order;

        mutateProducts.push({
          id,
          name,
          price,
          amount,
          items,
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
      toast.add({ message: 'Failed to add order.', type: 'error', duration: 2000 });
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
    mutate   : mutateDeleteOrderFn,
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
    const {
      id,
      image,
      name,
      items,
      stock,
      price,
      quantity,
    } = product;
    const order = orderedProducts.value.find(product => product.id === id);

    if (order) {
      if (isBundle(id)) {
        order.amount += 1;
      } else {
        if (order.amount < stock) order.amount += quantity;
      }
    } else {
      const bundle_items = [];

      if (items) {
        for (const item of items) {
          const { id, name, quantity } = item;

          bundle_items.push({ id, name, quantity });
        }
      }

      orderedProducts.value.push({
        amount: quantity ? quantity : 1,
        items : bundle_items.length ? bundle_items : undefined,
        id,
        image,
        name,
        price,
        stock,
        quantity,
      });
    }

    console.log('Ordered Products:', orderedProducts.value);
  };

  const handleClickDecrement = (product: any) => {
    const { id, quantity } = product;
    const order = orderedProducts.value.find(product => product.id === id);

    if (order) {
      if (order.amount > 1) {
        order.amount -= quantity ? quantity : 1;
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

  const goBacktoSales = () => {
    router.push('/sales');
  };

  return {
    salesId     : params.id,
    detailsData : detailsData as Ref<DetailsNormalizerReturn>,
    productsData: productsData as Ref<ProductsNormalizerReturn>,
    ordersData  : ordersData as Ref<OrdersNormalizerReturn>,
    controlsView,
    orderedProducts,
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
    isMutateAddOrderLoading,
    isMutateDeleteOrderLoading,
    goBacktoSales,
    handleClickDecrement,
    handleClickIncrement,
    handleClickQuantityDecrement,
    handleClickCalculator,
    handleClickCancel,
    handleClickClear,
    handlePayment,
    handleShowOrderHistory,
  };
};
