import { db } from '..';

export default {
  async removeOrders() {
    /**
     * ----------------------------------------------
     * Get every orders from the sale and delete it.
     * ----------------------------------------------
     */
    const orders = db.order.find({
      selector: {
        sale_id: (this as any).id,
      },
    });

    await orders.remove();
  },
};
