import type { RxDocument } from 'rxdb';

import { db } from '@/database';

export default async (id: string) => {
  try {
    const _queryProduct = await db.product.findOne(id).exec();

    const removeFromBundles = async (bundles: RxDocument<any>[]) => {
      for (const bundle of bundles) {
        await bundle.incrementalModify((prev: RxDocument<any>) => {
          const index = prev.product.findIndex((data: RxDocument<any>) => data.id === id);

          prev.product.splice(index, 1);

          if (prev.product.length) {
            const inactive = prev.product.filter((data: RxDocument<any>) => data.active === false);

            prev.active = inactive.length ? false : true;
          } else {
            prev.active = false;
          }

          return prev;
        });
      }
    };

    if (!_queryProduct) throw `Cannot find product with id ${id}.`;

    const { variant } = _queryProduct;

    /**
     * ----------------------------------------
     * 1. Delete flow for product with variant.
     * ----------------------------------------
     */
    if (variant?.length) {
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
      const _queryVariant = db.variant.find({
        selector: {
          product_id: id,
        },
      });

      await _queryVariant.remove();

      /**
       * -------------------------------------------------------------------------------
       * 1.3 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const _queryBundle = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
            }
          }
        }
      }).exec();

      /**
       * ------------------------------------------------------------------------
       * 1.4 Recursively delete currently deleted product variant in each bundle.
       * ------------------------------------------------------------------------
       */
      if (_queryBundle.length) await removeFromBundles(_queryBundle);
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
          product: {
            $elemMatch: {
              id,
              variant_id: undefined,
            },
          },
        },
      }).exec();

      /**
       * ----------------------------------------------------------------
       * 2.3 Recursively delete currently deleted product in each bundle.
       * ----------------------------------------------------------------
       */
      if (_queryBundle.length) await removeFromBundles(_queryBundle);
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
