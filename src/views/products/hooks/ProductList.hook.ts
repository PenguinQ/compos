import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { queryRx, mutateRx } from '@helpers/fetcher';
import { useQuery, useMutation } from '@/database/hooks';
import { getProductList, mutateDeleteProduct, testMutate } from '@/database/query/product';

import { productListNormalizer } from '../normalizer/ProductList.normalizer';

/**
 * -------------------------
 * Mango Selector References
 * -------------------------
 * $lt  = less than
 * $lte = less than and equal
 * $ne  = not equal
 * $gt  = greater than
 * $gte = greater than and equal
 */
export const useProductList = () => {
  const router = useRouter();
  const limit = ref(5);
  // NOTES: DON'T REMOVE (NON-OBSERVER METHOD)
  // const querySelector: any = ref({ id: { $gte: '' } });
  // const products: any = ref([]);
  // const stopRefetch = ref(false);

  const {
    data: products,
    refetch: productsRefetch,
    isLoading: productsLoading,
    isError: productsError,
  } = useQuery({
    queryKey: [limit],
    queryFn: () => getProductList({
      query: {
        selector: {
          id: {
            $gte: '',
          },
        },
        sort: [{ id: 'asc' }],
        limit: limit.value,
      },
      normalizer: productListNormalizer,
    }),
    onError: (error: string) => {
      console.log('Error:', error);
    },
    onSuccess: (response: any[]) => {
      console.log('Response:', response);

      // NOTES: DON'T REMOVE (NON-OBSERVER METHOD)
      // if (response.length) {
      //   const last_id = response[response.length - 1].id;

      //   /**
      //    * "created_at $ne = ''" are used to force return any results from query since somehow
      //    * when using ULID as unique identifier and sorting descending "id" doesn't return
      //    * any next expected data for pagination.
      //    *
      //    * Check for this in the future.
      //    */
      //   querySelector.value = {
      //     created_at: { $ne: '' },
      //     id: { $lt: last_id },
      //   };

      //   products.value.push(...response);
      // } else {
      //   stopRefetch.value = true;
      // }
    },
  });

  const nextPage = () => {
    // NOTES: DON'T REMOVE (NON-OBSERVER METHOD)
    // if (!stopRefetch.value) productsRefetch();

    limit.value += 5;
  };

  const testID = ref('');

  const testUpdate = (e: Event, id: string) => {
    e.stopPropagation();
    testID.value = id;
    testFunc();
  };

  const {
    mutate: testFunc,
    isLoading: testMutateLoading,
  } = useMutation({
    mutateFn: () => testMutate(testID.value),
    onError: (error: string) => {

    },
    onSuccess: (response: any) => {

    },
  });

  return {
    products,
    productsLoading,
    productsError,
    nextPage,
    testUpdate,
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
