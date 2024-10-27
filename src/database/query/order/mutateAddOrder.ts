import { monotonicFactory } from 'ulidx';
import Big from 'big.js';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { isBundle, isProduct, isVariant } from '@/database/utils';
import { ORDER_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

type MutateAddOrderDataBundleItem = {
  id: string;
  name: string;
  quantity: number;
};

type MutateAddOrderDataProduct ={
  id: string;
  name: string;
  price: string;
  amount: number;
  items?: MutateAddOrderDataBundleItem[];
};

type MutateAddOrderData = {
  tendered: string;
  change: string;
  products: MutateAddOrderDataProduct[];
};

type MutateAddOrder = {
  id: string;
  data: MutateAddOrderData;
};

export default async ({ id, data }: MutateAddOrder) => {
  try {
    const ulid           = monotonicFactory();
    const order_id       = ORDER_ID_PREFIX + ulid();
    const order_products = [];
    let order_name       = 'Order #1';
    let order_total      = '0';

    const updateStock = async <T extends ProductDoc | VariantDoc>(
      document: RxDocument<T>,
      name: string,
      amount: number,
      isVariant = false
    ) => {
      const { stock } = document;

      if (stock - amount >= 0) {
        await document.modify(oldData => {
          oldData.stock      = oldData.stock - amount;
          oldData.updated_at = new Date().toISOString();

          if (oldData.stock === 0) oldData.active = false;

          return oldData;
        });
      } else {
        throw `Cannot update ${name} stock since the stock is 0.`;
      }

      const latest_document = document.getLatest();

      if (isVariant) {
        const main_product = await document.populate('product_id');

        await (document as any).updateProductStatus(main_product);
        await (document as any).updateBundlesStatus(latest_document);
      } else {
        await (document as any).updateBundlesStatus(latest_document);
      }
    };

    /**
     * -----------------------
     * 1. Generate Order Name.
     * -----------------------
     */
    const last_order = await db.order.find({
      selector: {
        sales_id: {
          $eq: id,
        },
      },
      sort: [{ created_at: 'desc' }],
      limit: 1,
    }).exec();

    if (last_order.length) {
      const { name } = last_order[0];
      const order_number = parseInt(name.substring(name.indexOf('#') + 1)) + 1;

      order_name = `Order #${order_number}`;
    }

    const { tendered, change, products } = data;

    /**
     * THERES SHOULD BE A GUARD HERE IF THE PRODUCT IS A BUNDLE THAT PREVENT SUBMISSION
     * IF THE PRODUCT INSIDE THE BUNDLE CONTAIN SOME OF THE PRODUCT IN SALES THAT THE BUNDLE
     * MAKE THE STOCK OF THE PRODUCT RELATED TURN TO 0
     *
     * 1. AS LONG ANY (PRODUCT * QUANTITY * AMOUNT) INSIDE THE BUNDLE STOCK IS 0 CANCEL THE ORDER
     */
    for (const product of products) {
      const { id } = product;

      if (isBundle(id)) {

      }
    }

    /**
     * ---------------------------
     * 2. Generate Order Products.
     * ---------------------------
     */
    for (const product of products) {
      const { id, name, price, amount } = product;

      order_products.push({
        id,
        name,
        price,
        quantity: amount,
        total: Big(price).times(amount).toString(),
      });

      order_total = Big(order_total).plus(Big(price).times(amount)).toString();
    }

    /**
     * -----------------
     * 3. Add New Order.
     * -----------------
     */
    await db.order.insert({
      id: order_id,
      sales_id: id,
      name: order_name,
      products: order_products,
      total: order_total,
      tendered,
      change,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    /**
     * ------------------------------
     * 4. Update Each Products Stock.
     * ------------------------------
     */
    for (const product of products) {
      const { id, name, amount } = product;
      let _queryProduct;

      if (isVariant(id)) {
        _queryProduct = await db.variant.findOne(id).exec() as RxDocument<VariantDoc>;

        if (_queryProduct) await updateStock(_queryProduct, name, amount, isVariant(id));
      } else if (isProduct(id)) {
        _queryProduct = await db.product.findOne(id).exec() as RxDocument<ProductDoc>;

        if (_queryProduct) await updateStock(_queryProduct, name, amount);
      } else if (isBundle(id)) {
        console.log('ID bosku');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
