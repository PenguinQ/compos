import { db } from '../';

export default {
  async removeOrders() {
    /**
     * ----------------------------------------------
     * Get every orders from the sales and delete it.
     * ----------------------------------------------
     */
    const orders = db.order.find({
      selector: {
        sales_id: (this as any).id,
      },
    });

    await orders.remove();
  },
};
