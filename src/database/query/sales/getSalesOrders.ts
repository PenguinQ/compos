import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import type { QueryParams } from '@/database/types';
import { OrderDoc } from '@/database/types';

export type ObservableReturns = {
  id: string;
  product_id?: string;
  active: boolean,
  images: string[],
  name: string,
  stock: number,
  price: number,
  sku?: string,
};

type GetSalesOrders = Omit<QueryParams, 'limit' | 'observe' | 'page'> & {
  id: string;
};

export default async ({ id, normalizer }: GetSalesOrders) => {
  try {
    const _queryOrders = db.order.find({ selector: { sales_id: id } }).$;

    const observeableProcessor = async (data: RxDocument<unknown>[]): Promise<object> => {
      const orders = [];

      for (const order of data) {
        const { id, name, products, total } = order as RxDocument<OrderDoc>;
        const order_products = [];

        for (const product of products) {
          const { id, name, total, quantity } = product;

          order_products.push({ id, name, total, quantity });
        }

        orders.push({
          id,
          name,
          products: order_products,
          total,
        });
      }

      return {
        data      : orders,
        data_count: orders.length,
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
