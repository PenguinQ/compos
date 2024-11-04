import { db } from '../';

export default {
  async removeFromSales() {
    /**
     * ---------------------------------------------------------------------------
     *  Get list of sales that contain the deleted bundle as one of it's products.
     * ---------------------------------------------------------------------------
     */
    const sales = await db.sales.find({
      selector: {
        products: {
          $elemMatch: {
            id: (this as any).id,
          },
        },
      },
    }).exec();

    /**
     * -----------------------------------------------------------
     * Recursively delete currently deleted product in each sales.
     * -----------------------------------------------------------
     */
    if (sales.length) {
      for (const sale of sales) {
        const { products } = sale;
        const filteredProducts = products.filter(product => product.id !== (this as any).id);

        await sale.incrementalModify(oldData => {
          oldData.products = filteredProducts;

          return oldData;
        });
      }
    }
  }
};
