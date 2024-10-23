import { db } from '@/database';

export default async (id: string) => {
  try {
    const _querySales = await db.sales.findOne(id).exec();

    /**
     * ---------------------------------------
     * 1. Remove any order related to this sales.
     * ---------------------------------------
     */
    if (_querySales) {
      const { orders } = _querySales;

      if (orders?.length) {
        const _queryOrders = await _querySales.populate('order');

        for (const order of _queryOrders) {
          await order.remove();
        }
      }

      /**
       * ---------------------
       * 2. Remove this sales.
       * ---------------------
       */
      await _querySales.remove();
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
