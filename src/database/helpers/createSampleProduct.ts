import { monotonicFactory } from 'ulidx';

import { db } from '../';

export default async () => {
  const productObj = [];
  const ulid = monotonicFactory();
  let bundle_data = [];
  let bundle_price = 0;
  let bundle_available = true;

  for (let i = 1; i < 30; i++) {
    const productID = 'PRD_' + ulid();
    const obj: any = {
      id: productID,
      active: i < 3 ? true : false,
      name: `Product ${i}`,
      description: `This is description for Product ${i}`,
      by: '',
      price: i === 1 ? 0 : 10000 * i,
      stock: i < 3 ? i : 0,
      sku: '',
      variant: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (i === 1) {
      const testIDOne = 'VAR_' + ulid();
      const testIDTwo = 'VAR_' + ulid();

      obj.variant.push(testIDOne);
      obj.variant.push(testIDTwo);

      const productArray = [
        {
          id: testIDOne,
          product_id: productID,
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
          product_id: productID,
          active: true,
          name: 'Variant 2',
          price: 200000,
          stock: 2,
          sku: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Push sample product variant as a product in a bundle.
      // One variant version
      bundle_data.push({ id: productID, variant_id: testIDOne, active: productArray[0].active });
      bundle_price += productArray[0].price;
      bundle_available = productArray[0].active ? true : false;

      // Two variant version
      // bundle_data.push({ id: productID, variant_id: testIDOne, active: productArray[0].active });
      // bundle_data.push({ id: productID, variant_id: testIDTwo, active: productArray[1].active });
      // bundle_price += productArray[0].price;
      // bundle_price += productArray[1].price;
      // bundle_available = productArray[0].active && productArray[1].active ? true : false;

      await db.variant.bulkInsert(productArray);
    }

    productObj.push(obj);
  }

  // Push sample product with no variant as a product in a bundle.
  bundle_data.push({ id: productObj[1].id, active: productObj[1].active });
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
