import type { RxDocument } from 'rxdb';
import type { Observable } from 'rxjs';

import { db } from '@/database';
import { getPageStatus } from '@/database/utils';
import type { QueryParams } from '@/database/types';
import type { SaleDoc } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

interface GetSaleListParams extends Omit<QueryParams, 'limit' | 'page'> {
  status: string;
  page: number;
  limit: number;
  sort: 'asc' | 'desc';
}

export type QueryReturn = {
  data: SaleDoc[];
  data_count: number;
  observable?: boolean;
  page: {
    current: number;
    first: boolean;
    last: boolean;
    total: number;
  };
};

export type ObservableQueryReturn = {
  observable: true;
  observableQuery: Observable<RxDocument<SaleDoc>[]>;
  observableQueryFn: (data: RxDocument<SaleDoc>[]) => Promise<Omit<QueryReturn, 'observable'>>;
};

export default (async ({
  limit,
  observe = false,
  page,
  search_query,
  sort,
  status,
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

    const queryFn = async (query: RxDocument<SaleDoc>[] | Observable<RxDocument<SaleDoc>[]>) => {
      const sales_count = await getSalesCount();
      const total_page  = Math.ceil(sales_count / query_limit);
      const { first_page, last_page } = await getPageStatus({
        collection: 'sale',
        query     : {
          name    : { $regex: `.*${search_query}.*`, $options: 'i' },
          finished: { $eq: status === 'running' ? false : true },
        },
        data      : query as RxDocument<SaleDoc>[],
        sortBy    : [{ id: sort }],
        sort,
        db,
      });
      const sales_data = await getSalesData(query as RxDocument<SaleDoc>[]);

      return {
        data      : sales_data,
        data_count: sales_count,
        page      : {
          current: page,
          first  : first_page,
          last   : last_page,
          total  : total_page,
        },
      };
    };

    const _queryConstruct = db.sale.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });

    const _querySales = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    return observe ? {
      observable       : observe,
      observableQuery  : _querySales,
      observableQueryFn: queryFn,
    } : {
      observable: observe,
      ...await queryFn(_querySales),
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
}) as {
  (params: GetSaleListParams & { observe: true }): Promise<ObservableQueryReturn>;
  (params: GetSaleListParams & { observe?: false }): Promise<QueryReturn>;
};
