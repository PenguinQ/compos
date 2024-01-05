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
    const {
      name,
      description,
      image,
      by,
      price,
      stock,
      sku,
      variant: variants
    } = data;

    const queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    const updateBundles = async ({ id, stock, isVariant = false }: any) => {
      const queryIdentifier = isVariant ? 'variant_id' : 'id';
      const queryBundles = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              [queryIdentifier]: id,
            },
          }
        },
      }).exec();

      await queryBundles.map(async (bundle: any) => {
        await bundle.incrementalModify((prev: any) => {
          const index = prev.product.findIndex((data: any) => data[queryIdentifier] === id);

          prev.product[index].active = stock >= 1 ? true : false;

          const inactive = prev.product.filter((data: any) => data.active === false);

          prev.active = inactive.length ? false : true;

          return prev;
        });
      });
    };

    // 1. Update flow if product has variants
    if (variants.length) {
      const is_stocked = variants.filter((variant: any) => parseInt(variant.stock) !== 0).length;

      // 1.1 Update the product detail.
      await queryProduct.update({
        $set: {
          active: is_stocked ? true : false,
          name,
          description,
          image,
          price: 0,
          stock: 0,
          by,
          sku,
          updated_at: new Date().toISOString(),
        },
      });

      // 1.2 Looping to update every variants detail.
      await variants.map(async (variant: any) => {
        const {
          id: v_id,
          name: v_name,
          image: v_image,
          price: v_price,
          stock: v_stock,
          sku: v_sku,
        } = variant;

        const queryVariant = await db.variant.findOne({
          selector: {
            id: {
              $eq: v_id,
            },
          }
        }).exec();

        // 1.2.1 Update current variant detail.
        await queryVariant.update({
          $set: {
            active: parseInt(v_stock) > 0 ? true : false,
            name: v_name,
            image: v_image,
            price: parseInt(v_price),
            stock: parseInt(v_stock),
            sku: v_sku,
            updated_at: new Date().toISOString(),
          },
        });

        // 1.2.1 Update any bundle that contains current variant as one of it's product.
        await updateBundles({ id: v_id, stock: parseInt(v_stock), isVariant: true });
      });
    }
    // 2. Update flow if product has no variants.
    else {
      // 2.1 Update the product detail.
      await queryProduct.update({
        $set: {
          active: parseInt(stock) >= 1 ? true : false,
          name,
          description,
          image,
          by,
          price: parseInt(price),
          stock: parseInt(stock),
          sku,
          updated_at: new Date().toISOString(),
        },
      });

      // 1.2.1 Update any bundle that contains current product as one of it's product.
      await updateBundles({ id, stock: parseInt(stock) });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

/**
 * **************************
 * FOR DEVELOPMENT PURPOSES *
 * **************************
 *
 * Functions to create sample products.
 */
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
          active: true,
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

/**
 * **************************
 * FOR DEVELOPMENT PURPOSES *
 * **************************
 *
 * Functions to create sample bundles.
 */
export const createSampleBundle = async (data: any, bundle: any) => {
  const ulid = monotonicFactory();
  const productArr: any = [];
  const { product, price, available } = bundle;

  product.forEach((data: any) => {
    const { id, variant_id, active } = data;

    productArr.push({ id, variant_id, active });
  });

  return await db.bundle.bulkInsert([
    {
      id: ulid(),
      active: available,
      name: 'Bundle 1',
      description: 'Bundle 1 description',
      product: productArr,
      price: price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: ulid(),
      active: available,
      name: 'Bundle 2',
      description: 'Bundle 2 description',
      product: productArr,
      price: price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]);
};
