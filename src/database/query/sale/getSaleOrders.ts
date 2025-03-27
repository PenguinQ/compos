import Big from 'big.js';
import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import type {
  OrderDoc,
  OrderDocProduct,
  QueryParams,
} from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

type ObserveableDataProduct = OrderDocProduct;

type ObserveableDataOrder = {
  id: string;
  sale_id: string;
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

type GetSaleOrdersQuery = Omit<QueryParams, 'limit' | 'observe' | 'page'> & {
  id: string;
};

export default async ({ id, sort, normalizer }: GetSaleOrdersQuery) => {
  try {
    const _queryOrders = db.order.find({
      selector: { sale_id: id },
      sort: [{ id: sort ? sort : 'asc' }],
    }).$;

    const observeableProcessor = async (data: unknown): Promise<object> => {
      const orders_data = [];
      let total_change  = Big(0);

      for (const order of data as RxDocument<OrderDoc>[]) {
        const {
          id,
          canceled,
          sale_id,
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

        if (!canceled) {
          total_change = total_change.plus(Big(change));
        }

        orders_data.push({
          products: order_products,
          id,
          sale_id,
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
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
