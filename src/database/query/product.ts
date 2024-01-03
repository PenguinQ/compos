import { reactive, toRefs } from 'vue';
import { monotonicFactory } from 'ulidx';
import { db } from '@database';

interface ProductData {
  id: string;
  name: string;
  description?: string;
  image?: string;
  by?: string;
  price: unknown;
  stock?: number;
  sku?: string;
  timestamp: Date;
};

export const getProductDetail = async ({ id, normalizer }: any) => {
  try {
    const product = await db.product.findOne({ selector: { id } }).exec();
    const variant = await product.populate('variant');

    return {
      result: normalizer({ product, variant }),
    };
  } catch (error: unknown) {
    throw new Error(error as string);
  }
};

export const updateProduct = async (id: string, data: ProductData) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.update({
      $set: {
        name: data.name,
        description: data.description,
        image: data.image,
        by: data.by,
        price: parseInt(data.price as string),
        stock: data.stock,
        sku: data.sku,
      },
    });
  });
};

export const removeProduct = async (id: string) => {
  await db.product.findOne(id).exec().then((prod: any) => {
    prod.remove();
  });
};

export const mutateAddProduct = async ({ data }: any) => {
  try {
    const ulid = monotonicFactory();

    return await db.product.insert({
      id: ulid(),
      name: data.name,
      description: data.description,
      image: data.image,
      by: data.by,
      price: parseInt(data.price as string),
      stock: parseInt(data.stock as string),
      sku: data.sku,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateEditProduct = async ({ id, data }: any) => {
  try {
    const product = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    // const testChange = (oldData: any) => {
    //   oldData.updated_at = new Date().toISOString();
    //   oldData.name = data.name;
    //   oldData.price = data.price;
    //   // oldData.variant = data.variant;

    //   return oldData;
    // }

    // const productUpdate = await product.modify(testChange);

    const productUpdate = await product.update({
      $set: {
        updated_at: new Date().toISOString(),
        ...data,
      },
    });

    // Update any bundle items related contain the product after updating product data.
    if (productUpdate) {
      if (product.variant) {
        console.log(product.variant, productUpdate.variant);
      }

      // const isActive = data.stock !== 0 ? true : false;

      // const selector = productUpdate.variant ? {
      //   id: id
      // } : {
      //   id: id,
      //   variant: '',
      // };

      // const bundle = db.bundle.find({
      //   selector: {
      //     product: {
      //       $elemMatch: selector,
      //     },
      //   },
      // });

      // /**
      //  * Bundle price are automatically summed from product of each price,
      //  * unless the user set fixed price, so there's no need to query the product.
      //  *
      //  * Fixed product price are always the same even though individual product
      //  * price are changed.
      //  */
      // await bundle.update({
      //   $set: {
      //     active: isActive,
      //     updated_at: new Date().toISOString(),
      //   },
      // });
    }

    return productUpdate;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const createSampleProduct = async () => {
  const productObj = [];
  const ulid = monotonicFactory();
  let bundle_data = [];
  let bundle_price = 0;
  let bundle_available = true;

  for (let i = 1; i < 21; i++) {
    const productID = ulid();
    const obj: any = {
      id: productID,
      active: true,
      name: `Product ${i}`,
      description: `This is description for Product ${i}`,
      image: [`product_${i}_image_1_path`],
      by: '',
      price: 10000 * i,
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
          name: 'Variant 1',
          image: [
            `product_${i}_variant_1_image_1_path`,
            `product_${i}_variant_1_image_2_path`
          ],
          price: 100000,
          stock: 1,
          sku: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: testIDTwo,
          product_id: productID,
          name: 'Variant 2',
          image: [
            `product_${i}_variant_2_image_1_path`,
            `product_${i}_variant_2_image_2_path`
          ],
          price: 200000,
          stock: 2,
          sku: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      // Push sample product variant as a product in a bundle.
      bundle_data.push({ id: productID, variant_id: testIDOne });
      bundle_price += productArray[0].price;
      bundle_available = productArray[0].stock ? true : false;

      obj.variant.push(productArray);
      await db.variant.bulkInsert(productArray);
    }

    productObj.push(obj);
  }

  // Push sample product with no variant as a product in a bundle.
  bundle_data.push({ id: productObj[1].id });
  bundle_price += productObj[1].price;

  if (bundle_available) {
    bundle_available = productObj[1].stock ? true : false;
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

export const createSampleBundle = async (data: any, bundle: any) => {
  const ulid = monotonicFactory();
  const productArr: any = [];
  const { product, price, available } = bundle;

  product.forEach((data: any) => {
    const { id, variant_id } = data;

    productArr.push({ id, variant_id });

    // if (variant) {
    //   productArr.push({ id, product_id, variant: true });
    // } else {
    //   productArr.push({ id, variant: false });
    // }
  });

  return await db.bundle.insert({
    id: ulid(),
    active: available,
    name: 'Bundle 1',
    description: 'Bundle 1 description',
    product: productArr,
    price: price,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
};
