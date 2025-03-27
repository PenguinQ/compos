import Big from 'big.js';
import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { isBundle, isProduct } from '@/database/utils';
import type { Database, ProductDoc, SaleDoc, VariantDoc } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';


export default async (id: string) => {
  try {
    const _queryOrder = await db.order.findOne(id).exec();

    if (!_queryOrder) throw 'Order not found';

    const {
      canceled: order_canceled,
      products: order_products,
      total   : order_total,
    } = _queryOrder;

    if (order_canceled) throw 'Order already canceled';

    const _querySale: RxDocument<SaleDoc> = await _queryOrder.populate('sale_id');

    const updateStock = async <T extends ProductDoc | VariantDoc>(id: string, quantity: number) => {
      const collection      = isProduct(id) ? 'product' : 'variant' as keyof Database;
      const _queryConstruct = db[collection].findOne(id);
      const _query          = await _queryConstruct.exec();

      if (_query) {
        await _queryConstruct.modify((oldData: T) => {
          oldData.stock      = oldData.stock! + quantity;
          oldData.active     = oldData.stock! > 0;
          oldData.updated_at = new Date().toISOString();

          return oldData;
        });
      }
    };

    /**
     * -------------------------------------
     * 1. Updating individual product stock.
     * -------------------------------------
     */
    for (const order_product of order_products) {
      const { id, items, quantity } = order_product;

      /**
       * ----------------------------
       * 1.1. If product is a bundle.
       * ----------------------------
       */
      if (isBundle(id)) {
        for (const item of items || []) {
          const { id: item_id, quantity: item_quantity } = item;

          updateStock(item_id, quantity * item_quantity);
        }
      }
      /**
       * --------------------------------
       * 1.2. If product is not a bundle.
       * --------------------------------
       */
      else {
        updateStock(id, quantity);
      }
    }

    /**
     * -----------------------------------------
     * 2. Update sale that related to the order.
     * -----------------------------------------
     */
    await _querySale.modify(oldData => {
      let mutable_products = [...oldData.products_sold];

      for (const order_product of order_products) {
        const {
          id      : order_product_id,
          price   : order_product_price,
          quantity: order_product_quantity,
        } = order_product;

        const mutable_product_index = mutable_products.findIndex(p => p.id === order_product_id);

        if (mutable_product_index !== -1) {
          const mutable_product = mutable_products[mutable_product_index];

          if (mutable_product.quantity - order_product_quantity <= 0) {
            mutable_products = mutable_products.filter(p => p.id !== order_product_id);
          } else {
            mutable_products[mutable_product_index] = {
              ...mutable_product,
              quantity: mutable_product.quantity - order_product_quantity,
              total   :
                Big(mutable_product.total)
                .minus(Big(order_product_price).times(order_product_quantity))
                .toString(),
            };
          }
        }
      }

      oldData.products_sold = mutable_products;
      oldData.revenue       = Big(oldData.revenue).minus(Big(order_total)).toString();

      return oldData;
    });

    await _queryOrder.update({
      $set: {
        canceled  : true,
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
