import { db } from '@/database';

// Database Utilities
import { removeFromBundles, removeFromSales } from '@/database/utils';

export default async (id: string) => {
  try {
    const _queryProduct = await db.product.findOne(id).exec();

    if (!_queryProduct) throw `Cannot find product with id ${id}.`;

    const { variants } = _queryProduct;

    /**
     * ----------------------------------------
     * 1. Delete flow for product with variant.
     * ----------------------------------------
     */
    if (variants?.length) {
      /**
       * -----------------------
       * 1.1 Remove the product.
       * -----------------------
       */
      await _queryProduct.remove();

      /**
       * ----------------------------------------------
       * 1.2 Get variants of the product and delete it.
       * ----------------------------------------------
       */
      const _queryVariantConstruct = db.variant.find({
        selector: {
          product_id: id,
        },
      });

      await _queryVariantConstruct.remove();

      /**
       * -------------------------------------------------------------------------------
       * 1.3 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const _queryBundle = await db.bundle.find({
        selector: {
          products: {
            $elemMatch: {
              product_id: id,
            },
          },
        },
      }).exec();

      /**
       * ------------------------------------------------------------------------
       * 1.4 Recursively delete currently deleted product variant in each bundle.
       * ------------------------------------------------------------------------
       */
      if (_queryBundle.length) await removeFromBundles(id, _queryBundle, true);
    }
    /**
     * -------------------------------------------
     * 2. Delete flow for product without variant.
     * -------------------------------------------
     */
    else {
      /**
       * -----------------------
       * 2.1 Remove the product.
       * -----------------------
       */
      await _queryProduct.remove();

      /**
       * -------------------------------------------------------------------------------
       * 2.2 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const _queryBundle = await db.bundle.find({
        selector: {
          products: {
            $elemMatch: {
              id,
            },
          },
        },
      }).exec();

      /**
       * ----------------------------------------------------------------
       * 2.2 Recursively delete currently deleted product in each bundle.
       * ----------------------------------------------------------------
       */
      if (_queryBundle.length) await removeFromBundles(id, _queryBundle);

      /**
       * -------------------------------------------------------------------------------
       * 2.3 Get list of order that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const _querySales = await db.sales.find({
        selector: {
          products: {
            $elemMatch: {
              id,
            },
          },
        },
      }).exec();

      /**
       * ----------------------------------------------------------------
       * 2.4 Recursively delete currently deleted product in each bundle.
       * ----------------------------------------------------------------
       */
      // if (_querySales.length) await removeFromSales(id, _querySales);
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
