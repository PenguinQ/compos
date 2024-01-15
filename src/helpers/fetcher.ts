import type { RxDocument } from 'rxdb';
import { monotonicFactory } from 'ulidx';
import { db } from '@database';

interface QueryParams {
  collection: string;
  query?: object;
  subscribe?: boolean;
  params?: string;
  normalizer?: (result: RxDocument[]) => void;
}

interface MutateParams extends QueryParams {
  data?: any;
  method: 'post' | 'put' | 'delete';
};

export const queryRx = async ({ collection, query = {}, subscribe = false, normalizer }: QueryParams) => {
  if (!query) return false;

  try {
    let queryCollection: any;

    if (subscribe) {
      queryCollection = await db[collection].find(query).$

      return {
        subscribe,
        result: normalizer ? normalizer(queryCollection) : queryCollection,
      }
    }

    queryCollection = await db[collection].find(query).exec();

    return {
      subscribe,
      result: normalizer ? normalizer(queryCollection) : queryCollection,
    }
  } catch (error: unknown) {
    throw new Error(error as string)
  }
};

export const queryOneRx = async ({ collection, query, subscribe = false }: QueryParams) => {
  if (!query) return false;

  try {
    if (subscribe) {
      return {
        subscribe,
        result: await db[collection].findOne(query).$,
      }
    }

    return {
      subscribe,
      result: await db[collection].findOne(query).exec(),
    }
  } catch (error: unknown) {
    throw new Error(error as string);
  }
};

export const mutateRx = async ({ collection, query, data, method }: MutateParams) => {
  try {
    if (query) {
      if (method === 'put') {
        const collectionQuery = db[collection].find(query);

        return await collectionQuery.update({ $set: {
          updated_at: new Date().toISOString(),
          ...data,
        } });
      } else if (method === 'delete') {
        const collectionQuery = db[collection].find(query);

        return await collectionQuery.remove();
      }
    } else {
      if (method === 'post') {
        const ulid = monotonicFactory();

        return await db.product.insert({
          id: ulid(),
          name: data.name,
          description: data.description,
          image: data.image,
          by: data.by,
          price: parseInt(data.price as string),
          stock: parseInt(data.stock as string),
          sku: data.sku,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    throw new Error(error as string);
  }
};
