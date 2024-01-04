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
    const { variant: variants } = data;

    const product = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    // 1. Update flow if product has variants
    if (variants.length) {
      // 1.1 Promise to update variants, and any bundle that include the variants.
      const variantPromise = variants.map(async (variant: any) => {
        const {
          id: v_id,
          name: v_name,
          image: v_image,
          price: v_price,
          stock: v_stock,
          sku: v_sku,
        } = variant;

        // 1.1.1 Find the variant based on the variant id
        const queryVariant = await db.variant.findOne({
          selector: {
            id: {
              $eq: v_id,
            },
          }
        }).exec();

        // 1.1.2 Update the variant detail
        const queryUpdate = await queryVariant.update({
          $set: {
            active: parseInt(v_stock) > 0 ? true : false,
            name: v_name,
            price: v_price,
            image: v_image,
            stock: parseInt(v_stock),
            sku: v_sku,
            updated_at: new Date().toISOString(),
          },
        });

        // 1.1.3 Update any bundle that has current variant as it's product.
        if (queryUpdate) {
          const { stock: new_stock } = queryUpdate;

          const queryBundle = db.bundle.find({
            selector: {
              product: {
                $elemMatch: {
                  variant_id: v_id,
                },
              }
            },
          });

          const bundleExec = await queryBundle.exec();

          await Promise.allSettled(bundleExec.map(async (bundle: any) => {
            await bundle.incrementalModify((oldData: any) => {
              const index = oldData.product.findIndex((data: any) => data.variant_id === v_id);

              oldData.product[index].active = new_stock >= 1 ? true : false;

              const inactive = oldData.product.filter((data: any) => data.active === false);

              oldData.active = !inactive.length ? true : false;

              return oldData;
            });
          })).catch((error: unknown) => {
            throw new Error(error as string);
          });
        }
      });

      // 1.2 Promise to update product active status related to the variants.
      const productPromise = new Promise<void>((resolve) => {
        const stocked = variants.filter((variant: any) => parseInt(variant.stock) !== 0);

        if (stocked.length) {
          product.incrementalUpdate({ $set: { active: true } });
        } else {
          product.incrementalUpdate({ $set: { active: false } });
        }

        resolve();
      });

      const promises = [...variantPromise, productPromise];

      // 1.3 Run all promises (variantPromise, and productPromise)
      await Promise.allSettled(promises).catch((error: unknown) => {
        throw new Error(error as string);
      });
    }
    // 2. Update flow if product has no variants.
    else {
      console.log('Non Variant');
    }

    return false;

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

      const { stock } = productUpdate;

      const bundle = db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
            },
          }
        },
      });

      if (stock === 0) {
        await bundle.update({
          $set: {
            active: false,
          },
        });
      } else {
        await bundle.update({
          $set: {
            active: true,
          },
        });
      }

      // if (product.variant) {
      //   console.log('Halo', product.variant, productUpdate.variant);
      // }

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
      bundle_data.push({ id: productID, variant_id: testIDOne, active: productArray[0].active });
      bundle_data.push({ id: productID, variant_id: testIDTwo, active: productArray[1].active });
      bundle_price += productArray[0].price;
      bundle_price += productArray[1].price;
      bundle_available = productArray[0].active && productArray[1].active ? true : false;

      await db.variant.bulkInsert(productArray);
    }

    productObj.push(obj);
  }

  // Push sample product with no variant as a product in a bundle.
  // bundle_data.push({ id: productObj[1].id, active: productObj[1].active });
  // bundle_price += productObj[1].price;

  // if (bundle_available) {
  //   bundle_available = productObj[1].stock ? true : false;
  // }

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
