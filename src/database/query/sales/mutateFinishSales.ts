import Big from 'big.js';

import { db } from '@/database';

export default async (id: string): Promise<string> => {
  try {
    const _querySalesConstruct = db.sales.findOne(id);
    const _querySales          = await _querySalesConstruct.exec();

    if (!_querySales) throw `Cannot find sales with id ${id}.`;

    const { name, initial_balance } = _querySales;

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
    const products_sold       = <any[]>[];
    let   orders_total        = Big(0);
    let   orders_total_change = Big(0);

    for (const order of _queryOrders) {
      const { total, products, change } = order;

      for (const product of products) {
        const {
          quantity: product_quantity,
          id,
          name,
          price,
          total,
          sku,
          items,
        } = product;
        const inArray    = products_sold.find(product => product.id === id);
        const temp_items = [];

        if (inArray) {
          inArray.total     = Big(inArray.total).plus(total).toString();
          inArray.quantity += product_quantity;
        } else {
          if (items) {
            for (const item of items) {
              const { id, name, price, quantity: item_quantity, sku } = item;

              temp_items.push({
                quantity: item_quantity * product_quantity,
                id,
                name,
                price,
                ...(sku ? { sku }: {}),
              });
            }
          }

          products_sold.push({
            quantity: product_quantity,
            id,
            name,
            price,
            total,
            ...(items ? { items: temp_items } : {}),
            ...(sku ? { sku }: {}),
          });
        }
      };

      orders_total        = orders_total.plus(total);
      orders_total_change = orders_total_change.plus(change);
    }

    if (initial_balance) {
      if (orders_total_change.gt(Big(initial_balance))) throw `Cannot finish sales since the total change are greater than the remaining balance.`;
    }

    await _querySalesConstruct.update({
      $set: {
        finished     : true,
        revenue      : orders_total.toString(),
        products_sold: products_sold,
        updated_at   : new Date().toISOString(),
        ...(initial_balance ? { final_balance: Big(initial_balance).minus(orders_total_change).toString() } : {}),
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
