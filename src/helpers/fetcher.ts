import { db } from '@database';

interface QueryParams {
  collection: string;
  query?: object;
}

interface MutateParams extends QueryParams {
  data: object;
};

export const queryRx = async ({ collection, query = {} }: QueryParams) => {
  try {
    return await db[collection].find(query).exec();
  } catch (error: unknown) {
    throw new Error(error as string)
  }
};

export const queryOneRx = async ({ collection, query = {} }: QueryParams) => {
  try {
    return await db[collection].findOne(query).exec();
  } catch (error: unknown) {
    throw new Error(error as string);
  }
};

export const mutateOne = async () => {

};

export const mutateOneRx = async ({ collection, query, data }: MutateParams) => {
  try {
    return await db[collection].findOne(query).exec().then((result: any) => {
      result.update({
        $set: data,
      });
    });
  } catch (error) {
    throw new Error(error as string);
  }
};
