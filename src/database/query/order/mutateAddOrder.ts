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
  price: string;
  quantity: number;
  sku?: string;
};

type MutateAddOrderDataProduct ={
  id: string;
  name: string;
  price: string;
  amount: number;
  items?: MutateAddOrderDataBundleItem[];
  sku?: string;
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

      if (stock! - amount >= 0) {
        await document.modify(oldData => {
          oldData.stock      = oldData.stock! - amount;
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
        sale_id: {
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
     * ----------------------------------------------------------------------------------------------------
     * 2. Create a temporary list of all products, including every item inside a bundle for stock checking.
     * ----------------------------------------------------------------------------------------------------
     */
    const temp_list = <{ id: string; name: string; amount: number; stock: number; }[]>[];

    for (const product of products) {
      const { id, name, items, amount } = product;

      if (isBundle(id)) {
        for (const item of items!) {
          const {
            id      : item_id,
            name    : item_name,
            quantity: item_quantity,
          } = item;
          const in_temp_list = temp_list.find(product => product.id === item_id);

          if (in_temp_list) {
            const in_temp_index = temp_list.indexOf(in_temp_list);

            temp_list[in_temp_index].amount += item_quantity;
          } else {
            const _queryItem = await db[`${isVariant(item_id) ? 'variant' : 'product'}`].findOne({ selector: { id: item_id } }).exec() as RxDocument<ProductDoc | VariantDoc>;

            if (!_queryItem) `Cannot find product or variant with id of ${id}`;

            const { stock } = _queryItem;

            temp_list.push({
              id      : item_id,
              name    : item_name,
              amount  : item_quantity * amount,
              stock   : stock!,
            });
          }
        }
      } else {
        const in_temp_list = temp_list.find(product => product.id === id);

        if (in_temp_list) {
          const in_temp_index = temp_list.indexOf(in_temp_list);

          temp_list[in_temp_index].amount += amount;
        } else {
          const _queryProduct = await db[`${isVariant(id) ? 'variant' : 'product'}`].findOne(id).exec() as RxDocument<ProductDoc | VariantDoc>;

          if (!_queryProduct) `Cannot find product or variant with id of ${id}`;

          const { stock } = _queryProduct;

          temp_list.push({ id, name, amount, stock: stock! });
        }
      }
    }

    const order_valid = temp_list.every(product => product.amount <= product.stock);

    if (!order_valid) throw `Some of the products amount in the order are greater than the stock, please update it.`

    /**
     * ---------------------------
     * 3. Generate order products.
     * ---------------------------
     */
    for (const product of products) {
      const { id, name, price, amount, items, sku } = product;
      let item_list = undefined;

      if (items) {
        const temp_list = [];

        for (const item of items) {
          const { id, name, price, quantity, sku } = item;

          temp_list.push({
            id,
            name,
            price,
            quantity,
            ...(sku ? { sku } : {}),
          });
        }

        item_list = temp_list;
      }


      order_products.push({
        id,
        name,
        price,
        quantity: amount,
        total: Big(price).times(amount).toString(),
        ...(sku ? { sku } : {}),
        ...(items ? { items: item_list } : {}),
        // items: item_list,
      });

      order_total = Big(order_total).plus(Big(price).times(amount)).toString();
    }

    /**
     * ------------------------------
     * 4. Update each products stock.
     * ------------------------------
     */
    for (const product of products) {
      const { id, name, amount, items } = product;
      let _queryProduct;

      if (isVariant(id)) {
        _queryProduct = await db.variant.findOne(id).exec() as RxDocument<VariantDoc>;

        if (_queryProduct) await updateStock(_queryProduct, name, amount, isVariant(id));
      } else if (isProduct(id)) {
        _queryProduct = await db.product.findOne(id).exec() as RxDocument<ProductDoc>;

        if (_queryProduct) await updateStock(_queryProduct, name, amount);
      } else if (isBundle(id)) {
        if (!items) throw `Bundle ${id} has no product on it.`;

        for (const item of items) {
          const { id, quantity } = item;
          const _queryItem = await db[`${isVariant(id) ? 'variant' : 'product'}`].findOne(id).exec() as RxDocument<ProductDoc | VariantDoc>;

          if (_queryItem) await updateStock(_queryItem, name, amount * quantity);
        }
      }
    }

    /**
     * -----------------
     * 5. Add new order.
     * -----------------
     */
    await db.order.insert({
      id      : order_id,
      sale_id : id,
      canceled: false,
      name    : order_name,
      products: order_products,
      total   : order_total,
      tendered,
      change,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
