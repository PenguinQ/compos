import { reactive, toRefs } from 'vue';

import { db } from '@database';
import { queryRx } from '@helpers/fetcher';

interface ProductData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  by?: string;
  price: unknown;
  stock?: number;
  sku?: string;
  timestamp: Date;
};

// Hooks
export const useProducts = () => {
  const {
    data,
    isError,
    isLoading,
    isSuccess,
  } = useQuery({
    collection: 'product',
    onError: (error: string) => {
      console.log('Error', error);
    },
    onSuccess: () => {
      console.log('Success');
    },
  });

  return {
    data,
    isError,
    isLoading,
    isSuccess
  };
};

// Equals to useQuery in vue-query
export const useQuery: any = (params: any) => {
  if (!params) return false;

  const {
    collection,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

  const query = queryRx({ collection });

  query.then((result: any) => {
    states.isLoading = false;
    states.isSuccess = true;
    states.data = result;

    onSuccess && onSuccess();
  }).catch((error: Error) => {
    states.isLoading = false;
    states.isError = true;
    states.isSuccess = false;

    onError && onError(error);
  });

  return toRefs(states);
};

export const getProducts = async (subscribe = true) => {
  // Example
  // const query = myCollection
  //   .find({
  //     selector: {
  //       age: {
  //         $gt: 18
  //       }
  //     }
  //   });

  if (subscribe) {
    return await db.product.find({}).$
  }

  return await db.product.find().exec();
};

export const getProduct = async (id: string) => {
    return await db.product.findOne(id).exec();
};

export const getBundles = async (subscribe = true) => {
  if (subscribe) {
    return await db.bundle.find().$
  }

  return await db.bundle.find().exec();
};

export const getBundle = async () => {

};

export const addProduct = async (data: ProductData) => {
  await db.product.insert({
    id: data.id,
    name: data.name,
    description: data.description,
    image: data.image,
    by: data.by,
    price: parseInt(data.price as string),
    stock: data.stock,
    sku: data.sku,
    timestamp: new Date().toISOString(),
  });
};

export const updateProduct = async (id: string, data: ProductData) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.update({
      $set: {
        name: data.name,
        description: data.description,
        image: data.image,
        by: data.by,
        price: parseInt(data.price as string),
        stock: data.stock,
        sku: data.sku,
      },
    });
  });
};

export const removeProduct = async (id: string) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.remove();
  });
};

export const devPopulateProduct = async () => {
  const productObj = [];

  for (let i = 0; i < 5; i++) {
    const id = i;

    productObj.push({
      id: `${id}`,
      name: `Product ${id}`,
      description: `This is description for product ${id}`,
      image: '',
      by: '',
      price: 10000 * id,
      stock: 0,
      sku: '',
      timestamp: new Date().toISOString(),
    });
  }

  return await db.product.bulkInsert(productObj);
};
