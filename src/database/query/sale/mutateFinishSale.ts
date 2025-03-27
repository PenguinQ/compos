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
     * ---------------------------
     * 2. Calculate final balance.
     * ---------------------------
     */
    let orders_total_change = Big(0);

    for (const order of _queryOrders) {
      const { change } = order;

      orders_total_change = orders_total_change.plus(change);
    }

    if (initial_balance) {
      if (orders_total_change.gt(Big(initial_balance))) throw new Error(`Cannot finish sale since the total change are greater than the remaining balance`);
    }

    await _querySaleConstruct.update({
      $set: {
        finished  : true,
        updated_at: new Date().toISOString(),
        ...(initial_balance ? { final_balance: Big(initial_balance).minus(orders_total_change).toString() } : {}),
      },
    });

    return name;
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
