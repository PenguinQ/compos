import { monotonicFactory } from 'ulidx';
import type { RxDocument } from 'rxdb';

import { db } from '../';
import { getPaginationSelector, handlePagination } from '../utils';
import { SALES_ID_PREFIX } from '../constants';

type QueryParams = {
  limit: number;
  observe?: boolean;
  page: number;
  search_query?: string;
  sort: 'asc' | 'desc';
  normalizer?: (object: any) => void;
};

/**
 * -------------------------
 * Get List of Running Sales
 * -------------------------
 */
export const getSalesList = async ({
  search_query,
  page,
  sort,
  limit,
  normalizer,
  observe = false,
}: QueryParams) => {
  try {
    const query_selector = search_query ? { name: { $regex: `.*${search_query}.*`, $options: 'i' } } : { id: { $gt: '' } };
    const query_skip     = page > 1 ? (page - 1) * limit  : 0;
    const query_limit    = limit;
    const query_sort     = [{ id: sort }];
    let sales_count: number;

    if (search_query) {
      const _searchQuery = await db.sales.find({ selector: query_selector }).exec();

      sales_count = _searchQuery.length;
    } else {
      sales_count = await db.sales.count().exec();
    }

    const _queryConstruct = db.sales.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });
    const _querySales = observe ? _queryConstruct.$ : await _queryConstruct.exec();
    const total_page  = Math.ceil(sales_count / query_limit);
    const sales_data: object[] = [];

    /**
     * ---------------------
     * 1. Observable queries
     * ---------------------
     */
    if (observe) {
      const preprocessor = async (data: RxDocument<any>) => {
        const { first_selector, last_selector } = getPaginationSelector({
          data,
          query   : search_query,
          queryKey: 'name',
          sort,
        });
        const { first_page, last_page } = await handlePagination({
          collection: 'sales',
          selector  : { first: first_selector, last: last_selector },
          sort      : [{ id: sort }],
        });

        for (const sale of data) {
          sales_data.push(sale.toJSON());
        }

        return {
          sales     : sales_data,
          count     : sales_count,
          first_page,
          last_page,
          total_page,
        };
      };

      return {
        result      : _querySales,
        observe     : true,
        preprocessor,
        normalizer,
      };
    }

    /**
     * -------------------------
     * 2. Non-observable queries
     * -------------------------
     */
    const { first_selector, last_selector } = getPaginationSelector({
      data    : _querySales as RxDocument<any>[],
      query   : search_query,
      queryKey: 'name',
      sort,
    });
    const { first_page, last_page } = await handlePagination({
      collection: 'sales',
      selector  : { first: first_selector, last: last_selector },
      sort      : [{ id: sort }],
    });

    for (const sales of _querySales as RxDocument<any>[]) {
      sales_data.push(sales.toJSON());
    }

    const raw_data = {
      sales     : sales_data,
      count     : sales_count,
      first_page,
      last_page,
      total_page,
    };

    return {
      result: normalizer ? normalizer(raw_data) : raw_data,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

type SalesData = {
  name: string;
  product: string[];
};

export const newSales = async (data: SalesData) => {
  try {
    const ulid = monotonicFactory();
    const sales_id = `${SALES_ID_PREFIX}${ulid}`;
    const {
      name: sales_name,
      product: sales_product,
    } = data;

    await db.sales.insert({
      id: sales_id,
      name: sales_name,
      product: sales_product,
      finished: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const deleteSales = async (id: string) => {
  try {
    const _querySales = await db.sales.findOne(id).exec();

    if (_querySales) {
      const { order } = _querySales;

      if (order?.length) {
        const _queryOrders = await _querySales.populate('order');

        for (const order of _queryOrders) {
          await order.remove();
        }
      }

      await _querySales.remove();
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
