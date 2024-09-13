import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import type { SalesDoc } from '@/database/types';

export default async (id: string, sales: RxDocument<SalesDoc>[]) => {
  for (const sale of sales) {
    // const { finished, products } = sale;

    // if (!finished)


    // const new_products = products.filter(product => product === id);

    // for (const product of new_products) {
    //   const { id, product_id } = product;
    //   const collection         = product_id ? 'variant' : 'product';
    //   const _queryCollection   = await db[collection].findOne(id).exec();

    //   if (_queryCollection) {
    //     const { active, price } = _queryCollection;

    //     if (auto_price) new_price += price;
    //     new_active = active ? true : false;
    //   }
    // }

    // await sale.incrementalModify(prev => {
    //   prev.finished = new
    //   // prev.active   = new_active;
    //   // prev.price    = new_price;
    //   // prev.products = new_products;

    //   return prev;
    // });
  }
};
