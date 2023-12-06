import { v4 as uuidv4 } from 'uuid';
import { monotonicFactory } from 'ulidx';
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
    query,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

  const queryResult = queryRx({ collection, query });

  queryResult.then((result: any) => {
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

export const useQueryOne: any = (params: any) => {
  if (!params) return false;

  const {
    collection,
    query,
    onError,
    onSuccess,
  } = params;
  const states = reactive({
    data: null,
    isError: false,
    isLoading: true,
    isSuccess: false,
  });

  const queryResult = queryRx({ collection, query });

  queryResult.then((result: any) => {
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

export const setSampleData = async () => {
  const productObj = [];
  const ulid = monotonicFactory();

  for (let i = 1; i < 21; i++) {
    productObj.push({
      id: ulid(),
      name: `Product ${i}`,
      description: `This is description for Product ${i}`,
      image: `product_${i}_image_path`,
      by: '',
      price: 10000 * i,
      stock: 0,
      sku: 'a',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return await db.product.bulkInsert(productObj);
};

export const createSampleBundle = async (data: any) => {
  const ulid = monotonicFactory();
  const slicedData = data.slice(0, 2);
  const productID: string[] = [];
  const productImage: string[] = [];
  const productPrice: number[] = [];

  slicedData.forEach((data: any) => {
    productID.push(data.id)
    productImage.push(data.image);
    productPrice.push(data.price);
  });

  // console.log(productID.join(','));
  // console.log(productImage.join(','));
  // console.log(productPrice.reduce((a, b) => a + b, 0));

  return await db.bundle.insert({
    id: ulid(),
    name: 'Bundle 1',
    description: 'Bundle 1 description',
    product_id: productID.join(','),
    product_image: productImage.join(','),
    price: productPrice.reduce((a, b) => a + b, 0),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // const bundleObj = {
  //   id: ulid(),
  //   name: 'Bundle 1',
  //   description: 'Description of Bundle 1',
  //   product_id: {
  //     type: 'string',
  //   },
  //   product_image: {
  //     type: 'string',
  //   },
  //   price: {
  //     type: 'integer',
  //   },
  //   created_at: {
  //     type: 'date-time',
  //   },
  //   updated_at: {
  //     type: 'date-time',
  //   },
  // };

  // productObj.push({
  //   id: ulid(),
  //   name: `Product ${i}`,
  //   description: `This is description for Product ${i}`,
  //   image: '',
  //   by: '',
  //   price: 10000 * i,
  //   stock: 0,
  //   sku: 'a',
  //   created_at: new Date().toISOString(),
  //   updated_at: new Date().toISOString(),
  // });

  // return await db.bundle.insert();
};
