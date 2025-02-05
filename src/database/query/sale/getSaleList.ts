import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { getPageStatus } from '@/database/utils';
import type { QueryParams } from '@/database/types';
import type { SaleDoc } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

interface GetSaleListParams extends Omit<QueryParams, 'page' | 'limit'> {
  status: string;
  page: number;
  limit: number;
  sort: 'asc' | 'desc';
}

export default async ({
  limit,
  observe = false,
  page,
  search_query,
  sort,
  status,
  normalizer,
}: GetSaleListParams) => {
  try {
    const query_selector = search_query ? {
      name: { $regex: `.*${search_query}.*`, $options: 'i' },
      finished: { $eq: status === 'running' ? false : true },
    } : {
      id: { $gt: '' },
      finished: { $eq: status === 'running' ? false : true },
    };
    const query_skip     = page > 1 ? (page - 1) * limit  : 0;
    const query_limit    = limit;
    const query_sort     = [{ id: sort }];

    const getSalesCount = async () => {
      let _query;

      if (search_query) {
        _query = await db.sale.find({ selector: query_selector }).exec();

        return _query.length;
      }

      _query = await db.sale.find({
        selector: {
          finished: { $eq: status === 'running' ? false : true },
        },
      }).exec();

      return _query.length;
    };

    const getSalesData = async (data: RxDocument<SaleDoc>[]) => {
      const sales_data = [];

      for (const sales of data) {
        const sales_json = sales.toJSON();

        sales_data.push(sales_json);
      };

      return sales_data;
    };

    const _queryConstruct = db.sale.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });
    const _querySales = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    /**
     * ----------------------
     * 1. Observable queries.
     * ----------------------
     */
    if (observe) {
      const observeableProcessor = async (data: unknown): Promise<object> => {
        const sales_count = await getSalesCount();
        const total_page  = Math.ceil(sales_count / query_limit);
        const { first_page, last_page } = await getPageStatus({
          db,
          collection: 'sale',
          data: data as RxDocument<SaleDoc>[],
          sort,
          sortBy: [{ id: sort }],
          query: {
            name: { $regex: `.*${search_query}.*`, $options: 'i' },
            finished: { $eq: status === 'running' ? false : true },
          },
        });
        const sales_data = await getSalesData(data as RxDocument<SaleDoc>[]);

        return {
          data      : sales_data,
          data_count: sales_count,
          page      : {
            current: page,
            first: first_page,
            last: last_page,
            total: total_page,
          },
        };
      };

      return {
        observeable: true,
        result: _querySales,
        observeableProcessor,
        normalizer,
      };
    }

    /**
     * -------------------------
     * 2. Non-observable queries
     * -------------------------
     */
    const sales_count = await getSalesCount();
    const total_page = Math.ceil(sales_count / query_limit);
    const { first_page, last_page } = await getPageStatus({
      db,
      collection: 'sale',
      data: _querySales as RxDocument<SaleDoc>[],
      sort,
      sortBy: [{ id: sort }],
      query: {
        name: { $regex: `.*${search_query}.*`, $options: 'i' },
        finished: { $eq: status === 'running' ? false : true },
      },
    });
    const sales_data = await getSalesData(_querySales as RxDocument<SaleDoc>[]);

    const raw_data = {
      data      : sales_data,
      data_count: sales_count,
      page      : {
        current: page,
        first: first_page,
        last: last_page,
        total: total_page,
      },
    };

    return {
      result: normalizer ? normalizer(raw_data) : raw_data,
    }
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
