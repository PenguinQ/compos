import { db } from '@database';

interface Params {
  collection: string;
  query?: object;
}

// Equals to defaultQueryFn in fleedu
export const queryRx = async (params: Params) => {
  const { collection, query } = params;
  const findQuery = query ? query : {};

  try {
    return await db[collection].find(findQuery).exec();
  } catch (error) {
    console.log(error);
  }
};

// export const queryOneRx = async (params: any) => {
//   const { data, collection, query } = params;

//   try {
//     const queryResult = await db[collection].findOne(query).exec();
//   } catch (error) {
//     throw new Error(error);
//   } finally {

//   }
// };
