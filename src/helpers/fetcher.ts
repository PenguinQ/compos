import { v4 as uuidv4 } from 'uuid';
import { monotonicFactory } from 'ulidx';
import { db } from '@database';

interface QueryParams {
  collection: string;
  query?: object;
}

interface MutateParams extends QueryParams {
  data: any;
};

export const queryRx = async ({ collection, query = {} }: QueryParams) => {
  if (!query) return false;

  try {
    return await db[collection].find(query).exec();
  } catch (error: unknown) {
    throw new Error(error as string)
  }
};

export const queryOneRx = async ({ collection, query }: QueryParams) => {
  if (!query) return false;

  try {
    return await db[collection].findOne(query).exec();
  } catch (error: unknown) {
    throw new Error(error as string);
  }
};

export const mutateRx = async () => {

};

export const mutateOneRx = async ({ collection, query, data }: MutateParams) => {
  try {
    if (query) {
      return await db[collection].findOne(query).exec().then((result: any) => {
        result.update({
          $set: data,
        });
      });
    } else {
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
  } catch (error) {
    throw new Error(error as string);
  }
};
