import Big from 'big.js';
import type { RxDocument } from 'rxdb';
import type { Observable } from 'rxjs';

import { db } from '@/database';
import type { OrderDoc, QueryParams } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

interface GetSaleOrdersParams extends Omit<QueryParams, 'limit' | 'page'> {
  id: string;
}

export type QueryReturn = {
  data: {
    orders: OrderDoc[];
    orders_total_change: string;
  };
  data_count: number;
  observable?: boolean;
};

export type ObservableQueryReturn = {
  observable: true;
  observableQuery: Observable<RxDocument<OrderDoc>[]>;
  observableQueryFn: (data: RxDocument<OrderDoc>[]) => Promise<Omit<QueryReturn, 'observable'>>;
};

export default (async ({
  id,
  observe = false,
  sort,
}: GetSaleOrdersParams) => {
  try {
    const queryFn = async (query: RxDocument<OrderDoc>[] | Observable<RxDocument<OrderDoc>[]>) => {
      const orders = [];
      let total_change = Big(0);

      for (const order of query as RxDocument<OrderDoc>[]) {
        const { canceled, change } = order;
        orders.push(order);

        if (!canceled) {
          total_change = total_change.plus(Big(change));
        }
      }

      return {
        data: {
          orders,
          orders_total_change: total_change.toString(),
        },
        data_count: orders.length,
      };
    };

    const _queryConstruct = db.order.find({
      selector: { sale_id: id },
      sort: [{ id: sort ? sort : 'asc' }],
    });

    const _queryOrders = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    return observe ? {
      observable       : observe,
      observableQuery  : _queryOrders,
      observableQueryFn: queryFn,
    } : {
      observable: observe,
      ...await queryFn(_queryOrders),
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
}) as {
  (params: GetSaleOrdersParams & { observe: true }): Promise<ObservableQueryReturn>;
  (params: GetSaleOrdersParams & { observe?: false }): Promise<QueryReturn>;
};
