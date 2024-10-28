import Big from 'big.js';

import { db } from '@/database';

export default async (id: string): Promise<string> => {
  try {
    const _querySales = await db.sales.findOne(id).exec();

    if (!_querySales) throw `Cannot find sales with id ${id}.`;

    const { name, revenue } = _querySales;
    let sales_revenue = Big(revenue);

    /**
     * --------------------------------------------------------
     * 1. Get all sales orders where the order is not canceled.
     * --------------------------------------------------------
     */
    const _queryOrders = await db.order.find({
      selector: {
        sales_id: {
          $eq: id,
        },
        canceled: {
          $eq: false,
        },
      },
    }).exec();

    /**
     * ---------------------------------------------
     * 2. Sum the orders total as the sales revenue.
     * ---------------------------------------------
     */
    for (const order of _queryOrders) {
      sales_revenue = Big(sales_revenue).plus(order.total);
    }

    await _querySales.update({
      $set: {
        finished  : true,
        revenue   : sales_revenue.toString(),
        updated_at: new Date().toISOString(),
      },
    });

    return name;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
