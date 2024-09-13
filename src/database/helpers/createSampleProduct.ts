import { monotonicFactory } from 'ulidx';

import { db } from '../';

export default async () => {
  const ulid = monotonicFactory();
  const productObj = [];
  let bundle_data = [];
  let bundle_price = 0;
  let bundle_available = true;

  for (let i = 1; i < 30; i++) {
    const productId = 'PRD_' + ulid();
    const product: any = {
      id: productId,
      active: i < 3 ? true : false,
      name: `Product ${i}`,
      description: `This is description for Product ${i}`,
      by: '',
      price: i === 1 ? 0 : 10000 * i,
      stock: i < 3 ? i : 0,
      sku: '',
      variants: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    /**
     * --------------------------------------
     * Create 2 variant for the first product
     * --------------------------------------
     */
    if (i === 1) {
      const testIDOne = 'VAR_' + ulid();
      const testIDTwo = 'VAR_' + ulid();

      product.variants.push(testIDOne);
      product.variants.push(testIDTwo);

      const productArray = [
        {
          id: testIDOne,
          product_id: productId,
          active: true,
          name: 'Variant 1',
          price: 100000,
          stock: 1,
          sku: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: testIDTwo,
          product_id: productId,
          active: true,
          name: 'Variant 2',
          price: 200000,
          stock: 2,
          sku: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      bundle_data.push({ id: testIDOne, product_id: productId, active: productArray[0].active });
      bundle_price += productArray[0].price;
      bundle_available = productArray[0].active ? true : false;

      await db.variant.bulkInsert(productArray);
    }

    productObj.push(product);
  }

  // Push sample product with no variant as a product in a bundle.
  bundle_data.push({ id: productObj[1].id, product_id: '', active: productObj[1].active });
  bundle_price += productObj[1].price;

  if (bundle_available) {
    bundle_available = productObj[1].active ? true : false;
  }

  return {
    bundle: {
      product: bundle_data,
      price: bundle_price,
      available: bundle_available,
    },
    result: await db.product.bulkInsert(productObj),
  };
};
