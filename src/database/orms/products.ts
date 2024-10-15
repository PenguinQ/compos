import { db } from "../";

export default {
  async removeVariants() {
    /**
     * ------------------------------------------
     * Get variants of the product and delete it.
     * ------------------------------------------
     */
    const variants = db.variant.find({
      selector: {
        product_id: (this as any).id,
      },
    });

    await variants.remove();
  },
  async removeFromBundles(hasVariants?: boolean) {
    /**
     * ---------------------------------------------------------------------------
     * Get list of bundle that contain the deleted product as one of it's product.
     * ---------------------------------------------------------------------------
     */
    const bundles = await db.bundle.find({
      selector: {
        products: {
          $elemMatch: {
            id: (this as any).id,
          },
        },
      },
    }).exec();

    /**
     * ------------------------------------------------------------
     * Recursively delete currently deleted product in each bundle.
     * ------------------------------------------------------------
     */
    for (const bundle of bundles) {
      const { active, price, auto_price, products } = bundle;
      const newProducts = products.filter(product => product[hasVariants ? 'product_id' : 'id'] !== (this as any).id);
      let newPrice      = auto_price ? 0 : price;
      let newActive     = newProducts.length ? active : false;

      for (const product of newProducts) {
        const { id, product_id } = product;
        const collection         = product_id ? 'variant' : 'product';
        const _queryCollection   = await db[collection].findOne(id).exec();

        if (_queryCollection) {
          const { active, price } = _queryCollection;

          if (auto_price) newPrice += price;
          newActive = active ? true : false;
        }
      }

      await bundle.incrementalModify(prev => {
        prev.active   = newActive;
        prev.price    = newPrice;
        prev.products = newProducts;

        return prev;
      });
    }
  },
  async removeFromSales() {
    /**
     * ---------------------------------------------------------------------------
     * Get list of sales that contain the deleted product as one of it's products.
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
    for (const sale of sales) {
      const { products } = sale;
      const filteredProducts = products.filter(product => product.id !== (this as any).id);

      await sale.incrementalModify(prev => {
        prev.products = filteredProducts;

        return prev;
      });
    }
  },
};
