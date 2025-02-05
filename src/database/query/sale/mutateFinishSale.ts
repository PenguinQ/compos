import Big from 'big.js';

// Databases
import { db } from '@/database';

// Helpers
import createError from '@/helpers/createError';
import { ComPOSError } from '@/helpers/createError';

export default async (id: string): Promise<string> => {
  try {
    const _querySaleConstruct = db.sale.findOne(id);
    const _querySale          = await _querySaleConstruct.exec();

    if (!_querySale) throw createError('Sale not found', { status: 404 });

    const { name, initial_balance } = _querySale;

    /**
     * -------------------------------------------------------
     * 1. Get all sale orders where the order is not canceled.
     * -------------------------------------------------------
     */
    const _queryOrders = await db.order.find({
      selector: {
        sale_id: {
          $eq: id,
        },
        canceled: {
          $eq: false,
        },
      },
    }).exec();

    /**
     * --------------------------------------------
     * 2. Sum the orders total as the sale revenue.
     * --------------------------------------------
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
      if (orders_total_change.gt(Big(initial_balance))) throw new Error(`Cannot finish sale since the total change are greater than the remaining balance`);
    }

    await _querySaleConstruct.update({
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
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
