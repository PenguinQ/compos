import { inject, ref } from 'vue';
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

export const useSalesDashboard = () => {
  const route = useRoute();
  const { params } = route;
  const toast = inject('ToastProvider');
  const products = ref([]);
  const loadProducts = ref(false);
  const loadOrders = ref(false);

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

      for await (const product of productsResult) products.value.push(product);

      loadProducts.value = true;
      loadOrders.value = true;
    },
  });

  const {
    isError: isProductsError,
    isLoading: isProductsLoading,
  } = useObservableQuery({
    queryKey: ['sales-dashboard-products', params.id],
    queryFn: () => getSalesProducts({
      products: products.value,
      normalizer: productsNormalizer,
    }),
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

  return {
    salesId: params.id,
    detailsData,
    isDetailsError,
    isDetailsLoading,
    isProductsError,
    isProductsLoading,
    isOrdersError,
    isOrdersLoading,
  };
};
