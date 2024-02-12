import { monotonicFactory } from 'ulidx';

import { db } from '../';
import { SALES_ID_PREFIX } from '../constants';

export const getSalesList = async ({ search_query, page, sort, limit, normalizer }: any) => {
  try {
    const query_selector = search_query ? { name: { $regex: `.*${search_query}.*`, $options: 'i' } } : { id: { $gte: '' } };
    const query_skip     = page > 1 ? (page - 1) * limit : 0;
    const query_limit    = limit;
    const query_sort     = [{ id: sort }];
    let queryCount: number;

    if (search_query) {
      const _searchQuery = await db.sales.find({ selector: query_selector }).exec();

      queryCount = _searchQuery.length;
    } else {
      queryCount = await db.sales.count().exec();
    }

    // ...
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
    const sales_id = `${SALES_ID_PREFIX}_${ulid}`;
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
