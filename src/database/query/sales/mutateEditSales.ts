import { sanitize } from 'isomorphic-dompurify';
import Big from 'big.js';

import { db } from '@/database';
import type { SalesDocProduct } from '@/database/types';

import { isNumeric } from '@/helpers';

type MutateEditSalesQueryData = {
  name: string;
  balance?: string;
  products: SalesDocProduct[];
};

type MutateEditSalesQuery = {
  id: string;
  data: MutateEditSalesQueryData;
};

export default async ({ id, data }: MutateEditSalesQuery) => {
  try {
    const _queryConstruct = db.sales.findOne(id);
    const _querySales     = await _queryConstruct.exec();

    if (!_querySales) throw `Cannot find sales with id ${id}.`;

    const { finished } = _querySales;
    const { name, balance, products } = data;
    const clean_name      = sanitize(name);
    let initial_balance   = balance;

    if (finished)                 throw 'You cannot edit finished sales.';
    if (clean_name.trim() === '') throw 'Name cannot be empty.';
    if (!products.length)         throw 'Product cannot be empty.';
    if (initial_balance && !isNumeric(initial_balance)) throw 'Balance must be a number';

    /**
     * -----------------------------------------------------------------------------------------------------
     * If balance is not undefined, compare the balance value with the total sum of change from every order.
     * -----------------------------------------------------------------------------------------------------
     * If new balance is lower than the total sum of change, abort the operation.
     */
    if (initial_balance) {
      const _queryOrders = await db.order.find({
        selector: {
          sales_id: {
            $eq: id,
          },
        },
      }).exec();

      let change_total = Big(0);

      for (const order of _queryOrders) {
        const { change } = order;

        change_total = change_total.plus(Big(change));
      }

      if (change_total.gt(Big(initial_balance))) throw `New balance are lower than the sum of change of every order, please check it again.`;
    }

    await _queryConstruct.update({
      $set: {
        name: clean_name,
        products,
        ...(initial_balance ? { initial_balance } : {}),
      },
    });

    /**
     * ------------------------------------------------------------
     * If balance is undefined, unset the initial_balance of sales.
     * ------------------------------------------------------------
     */
    if (!initial_balance) {
      await _queryConstruct.update({
        $unset: {
          initial_balance: true,
        },
      });
    }

    await _queryConstruct.update({
      $set: {
        updated_at: new Date().toISOString(),
      },
    });

    return clean_name;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
