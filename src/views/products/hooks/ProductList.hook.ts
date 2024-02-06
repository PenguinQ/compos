import { ref, inject, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { queryRx, mutateRx } from '@helpers/fetcher';
import { useQuery, useMutation } from '@database/hooks';
import { getProductList, mutateDeleteProduct } from '@database/query/product';
import { debounce } from '@helpers';

import { productListNormalizer } from '../normalizer/ProductList.normalizer';

export const useProductList = () => {
  const router = useRouter();
  const stop_refetch = ref(false);
  const page = ref(1);
  const total_page = ref();
  const search_query = ref('');

  const {
    data,
    refetch: productsRefetch,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: [search_query],
    queryFn: () => getProductList({
      search_query: search_query.value,
      sort: 'asc',
      limit: 10,
      page: page.value,
      normalizer: productListNormalizer,
    }),
    onError: (error: string) => {
      console.log('[ERROR] Failed to get product list:', error);
    },
    onSuccess: (response: any) => {
      console.log('[SUCCESS] Product list:', response);

      const { total_page: total, products } = response;

      total_page.value = total;

      if (!products.length) stop_refetch.value = true;
    },
  });

  const handleSearch = debounce((e: Event) => {
    const target = e.target as HTMLInputElement;

    page.value = 1;

    search_query.value = target.value;
  });

  const toPrevPage = (e: Event, toFirst?: boolean) => {
    const { first_page } = data.value;

    if (toFirst) {
      page.value = 1;
    } else {
      page.value -= 1;
    }

    !first_page && productsRefetch();
  };

  const toNextPage = (e: Event, toLast?: boolean) => {
    const { last_page, total_page } = data.value;

    if (toLast) {
      page.value = total_page;
    } else {
      page.value += 1;
    }

    !last_page && productsRefetch();
  };

  return {
    data,
    search_query,
    page,
    total_page,
    productsError,
    productsLoading,
    productsRefetch,
    toNextPage,
    toPrevPage,
    handleSearch,
  };
};

// export const useProduct = () => {
//   const selector = ref<any>({
//     id: {
//       $gte: ''
//     },
//   });
//   const products = ref([]);
//   const deleteID = ref<string | null>(null);
//   const stopQuery = ref(false);
//   const {
//     data,
//     refetch,
//     isError,
//     isLoading,
//     isSuccess,
//   } = useQuery({
//     queryFn: () => queryRx({
//       collection: 'product',
//       query: {
//         selector: selector.value,
//         sort: [
//           { id: 'asc' },
//         ],
//         limit: 5,
//       },
//     }),
//     onError: (error: any) => {
//       console.log('Failed to get products data', error);
//     },
//     onSuccess: (result: any) => {
//       if (result.length) {
//         const lastID = result[result.length - 1]._data.id;

//         selector.value = {
//           /**
//            * "created_at $ne = ''" are used to force return any results from query since somehow
//            * when using ULID as unique identifier and sorting descending "id" doesn't return
//            * any next expected data for pagination.
//            *
//            * Check for this in the future.
//            */
//           created_at: {
//             $ne: '',
//           },
//           id: {
//             $lt: lastID,
//           },
//         };

//         products.value.push(...result);
//       } else {
//         stopQuery.value = true;
//       }
//     },
//   });

//   const {
//     mutate: mutateRemove,
//     isLoading: mutateRemoveLoading,
//   } = useMutation({
//     mutateFn: () => mutateRx({
//       method: 'delete',
//       collection: 'product',
//       query: {
//         selector: {
//           id: {
//             $eq: deleteID.value,
//           },
//         },
//       },
//     }),
//     onError: (error: any) => {
//       console.log('Failed to remove product.', error);
//     },
//     onSuccess: () => {
//       console.log('Success to remove product');

//       const index = products.value.findIndex((data: any) => data.id === deleteID.value);

//       products.value.splice(index, 1);
//     },
//   });

//   const {
//     mutate: mutateDelete,
//     isLoading: mutateDeleteLoading,
//   } = useMutation({
//     mutateFn: () => mutateDeleteProduct(deleteID.value),
//     onError: (error: unknown) => {
//       console.log(error);
//     },
//     onSuccess: () => {
//       const index = products.value.findIndex((data: any) => data.id === deleteID.value);

//       products.value.splice(index, 1);
//     },
//   });

//   const nextPage = () => {
//     if (!stopQuery.value) refetch();
//   };

//   return {
//     deleteID,
//     data,
//     products,
//     isError,
//     isLoading,
//     isSuccess,
//     mutateDelete,
//     mutateDeleteLoading,
//     mutateRemove,
//     mutateRemoveLoading,
//     nextPage,
//   };
// };
