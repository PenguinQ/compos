import Big from 'big.js';
import type { RxDocument } from 'rxdb';

import { db } from '..';
import type { ProductDoc, VariantDoc } from '../types';

export default {
  async updateProductStatus(product: RxDocument<ProductDoc>) {
    const { variants } = product;
    const actives = [];

    /**
     * -----------------------------------------------
     * Recursively get active status for each variant.
     * -----------------------------------------------
     */
    for (const id of variants!) {
      const _queryVariant = await db.variant.findOne(id).exec();

      if (_queryVariant) {
        const { active } = _queryVariant;

        actives.push(active);
      }
    }

    /**
     * ---------------------------------------------------------------------
     * Set the product active status as false if every variants is inactive.
     * ---------------------------------------------------------------------
     */
    if (actives.every(active => !active)) {
      await product.modify(oldData => {
        oldData.active     = false;
        oldData.updated_at = new Date().toISOString();

        return oldData;
      });
    }
  },
  async updateBundlesStatus<T extends ProductDoc | VariantDoc>(document: RxDocument<T>) {
    const { id, active } = document;

    if (!active) {
      /**
       * ---------------------------------------------------------------------
       * Get list of bundles that contain product with id same as document id.
       * ---------------------------------------------------------------------
       */
      const _queryBundles = await db.bundle.find({
        selector: {
          products: {
            $elemMatch: {
              id,
            },
          },
        },
      }).exec();

      /**
       * -----------------------------------------------------------------------------
       * Recursively update bundle product active status and the bundle status itself.
       * -----------------------------------------------------------------------------
       */
      for (const bundle of _queryBundles) {
        const { products } = bundle;
        const updatedProducts = products.map(product => product.id === id ? { ...product, active } : product);
        const hasInactive     = updatedProducts.some(product => !product.active);

        await bundle.modify(oldData => {
          if (hasInactive) oldData.active = false;

          oldData.products   = updatedProducts;
          oldData.updated_at = new Date().toISOString();

          return oldData;
        });
      }
    }
  },
  async removeFromBundles() {
    /**
     * ---------------------------------------------------------------------------
     * Get list of bundle that contain the deleted variant as one of it's product.
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
     * Recursively delete currently deleted variant in each bundle.
     * ------------------------------------------------------------
     */
    for (const bundle of bundles) {
      const { active, price, auto_price, products } = bundle;
      const newProducts = products.filter(product => product.id !== (this as any).id);
      let newPrice      = auto_price ? '0' : price;
      let newActive     = newProducts.length ? active : false;

      for (const product of newProducts) {
        const { id, product_id, quantity } = product;
        const collection         = product_id ? 'variant' : 'product';
        const _queryCollection   = await db[collection].findOne(id).exec();

        if (_queryCollection) {
          const { active, price } = _queryCollection;

          if (auto_price) newPrice = Big(newPrice).plus(price!).times(quantity).toString();
          newActive = active ? true : false;
        }
      }

      await bundle.incrementalModify(oldData => {
        oldData.active     = newActive;
        oldData.price      = newPrice;
        oldData.products   = newProducts;
        oldData.updated_at = new Date().toISOString();

        return oldData;
      });
    }
  },
  async removeFromSales() {
    /**
     * ---------------------------------------------------------------------------
     * Get list of sales that contain the deleted variant as one of it's products.
     * ---------------------------------------------------------------------------
     */
    const sales = await db.sale.find({
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
