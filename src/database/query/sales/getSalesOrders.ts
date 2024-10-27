import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import type {
  OrderDoc,
  OrderDocProduct,
  QueryParams,
} from '@/database/types';

type ObserveableDataProduct = OrderDocProduct;

type ObserveableData = {
  id: string;
  sales_id: string;
  name: string;
  products?: OrderDocProduct[];
  tendered: string;
  change: string;
  total: string;
};

export type ObservableReturns = {
  data: ObserveableData[];
  data_count: number;
};

type GetSalesOrdersQuery = Omit<QueryParams, 'limit' | 'observe' | 'page'> & {
  id: string;
};

export default async ({ id, normalizer }: GetSalesOrdersQuery) => {
  try {
    const _queryOrders = db.order.find({ selector: { sales_id: id } }).$;

    const observeableProcessor = async (data: RxDocument<unknown>[]): Promise<object> => {
      const orders_data = <ObserveableData[]>[];

      for (const order of data) {
        const {
          id,
          sales_id,
          name,
          products,
          tendered,
          change,
          total,
        } = order as RxDocument<OrderDoc>;
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

        orders_data.push({
          products: order_products,
          id,
          sales_id,
          name,
          tendered,
          change,
          total,
        });
      }

      return {
        data      : orders_data,
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
