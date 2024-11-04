import type { RxDocument } from 'rxdb';

import { db } from '@/database';

type GetPageStatusParams = {
  collection: keyof typeof db;
  data: RxDocument<any>[];
  sort: 'asc' | 'desc';
  sortBy: object[];
  query: object;
};

type GetPageStatusReturn = {
  first_page: boolean;
  last_page: boolean;
};

export default async ({ collection, data, sort = 'desc', sortBy, query }: GetPageStatusParams): Promise<GetPageStatusReturn> => {
  try {
    const first_id = data[0]?.id || '';
    const last_id = data[data.length - 1]?.id || '';
    let first_selector;
    let last_selector;

    if (!first_id && !last_id) return { first_page: false, last_page: false };

    if (query) {
      first_selector = sort === 'desc' ? { id: { $gt: first_id }, ...query } : { id: { $lt: first_id }, ...query };
      last_selector = sort === 'desc' ? { id: { $lt: last_id }, ...query } : { id: { $gt: last_id }, ...query };
    } else {
      first_selector = sort === 'desc' ? { id: { $gt: first_id } } : { id: { $lt: first_id } };
      last_selector = sort === 'desc' ? { id: { $lt: last_id } } : { id: { $gt: last_id } };
    }

    const _queryFirst = await db[collection].find({ selector: first_selector, sort: sortBy, limit: 1 }).exec();
    const _queryLast = await db[collection].find({ selector: last_selector, sort: sortBy, limit: 1 }).exec();

    return {
      first_page: _queryFirst.length ? false : true,
      last_page: _queryLast.length ? false : true,
    };
  } catch (error) {
    if (error instanceof Error) throw error.message;

    throw error;
  }
};
