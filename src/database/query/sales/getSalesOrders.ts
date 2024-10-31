import Big from 'big.js';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import type {
  OrderDoc,
  OrderDocProduct,
  QueryParams,
} from '@/database/types';

type ObserveableDataProduct = OrderDocProduct;

type ObserveableDataOrder = {
  id: string;
  sales_id: string;
  canceled: boolean;
  name: string;
  products: OrderDocProduct[];
  total: string;
  tendered: string;
  change: string;
};

type ObserveableData = {
  orders: ObserveableDataOrder[];
  orders_total_change: string;
};

export type ObservableReturns = {
  data: ObserveableData;
  data_count: number;
};

type GetSalesOrdersQuery = Omit<QueryParams, 'limit' | 'observe' | 'page'> & {
  id: string;
};

export default async ({ id, sort, normalizer }: GetSalesOrdersQuery) => {
  try {
    const _queryOrders = db.order.find({
      selector: { sales_id: id },
      sort: [{ id: sort ? sort : 'asc' }],
    }).$;

    const observeableProcessor = async (data: unknown): Promise<object> => {
      const orders_data = [];
      let total_change  = Big(0);

      for (const order of data as RxDocument<OrderDoc>[]) {
        const {
          id,
          canceled,
          sales_id,
          name,
          products,
          tendered,
          change,
          total,
        } = order;
        const order_products = <ObserveableDataProduct[]>[];

        for (const product of products) {
          const { id, name, price, items, quantity, total } = product;

          order_products.push({
            id,
            name,
            items,
            price,
            total,
            quantity,
          });
        }

        total_change = total_change.plus(Big(change));

        orders_data.push({
          products: order_products,
          id,
          sales_id,
          canceled,
          name,
          total,
          tendered,
          change,
        });
      }

      return {
        data: {
          orders             : orders_data,
          orders_total_change: total_change.toString(),
        },
        data_count: orders_data.length,
      };
    };

    return {
      observeable: true,
      result: _queryOrders,
      observeableProcessor,
      normalizer,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
