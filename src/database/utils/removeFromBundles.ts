import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import type { BundleDoc } from '@/database/types';

export default async (id: string, bundles: RxDocument<BundleDoc>[], hasVariant = false) => {
  for (const bundle of bundles) {
    const { active, price, auto_price, products } = bundle;
    const new_products = products.filter(product => product[hasVariant ? 'product_id' : 'id'] !== id);
    let new_price      = auto_price ? 0 : price;
    let new_active     = new_products.length ? active : false;

    for (const product of new_products) {
      const { id, product_id } = product;
      const collection         = product_id ? 'variant' : 'product';
      const _queryCollection   = await db[collection].findOne(id).exec();

      if (_queryCollection) {
        const { active, price } = _queryCollection;

        if (auto_price) new_price += price;
        new_active = active ? true : false;
      }
    }

    await bundle.incrementalModify(prev => {
      prev.active   = new_active;
      prev.price    = new_price;
      prev.products = new_products;

      return prev;
    });
  }
};
