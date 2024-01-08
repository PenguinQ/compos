import { reactive, toRefs } from 'vue';
import { createBlob } from 'rxdb';
import { monotonicFactory } from 'ulidx';
import { db } from '@database';

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

export const mutateAddProduct = async ({ data }: any) => {
  try {
    const ulid = monotonicFactory();
    const product_id = 'PRD_' + ulid();
    const {
      name,
      description,
      image,
      by,
      price,
      stock,
      sku,
      variant,
    } = data;

    if (variant.length) {
      let product_active = true;
      const variant_array: any = [];
      const variant_ids: string[] = [];

      variant.map((v: any) => {
        const id = 'VAR_' + ulid();

        variant_ids.push(id);
        variant_array.push({
          id,
          product_id: product_id,
          active: parseInt(v.stock) >= 1 ? true : false,
          name: v.name,
          image: v.image,
          price: parseInt(v.price),
          stock: parseInt(v.stock),
          sku: v.sku,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      const inactiveVariant = variant_array.filter((v: any) => v.active === false);

      if (inactiveVariant.length === variant_array.length) {
        product_active = false;
      }

      await db.product.insert({
        id: product_id,
        active: product_active,
        name,
        description,
        image,
        by,
        variant: variant_ids,
        price: 0,
        stock: 0,
        sku: data.sku,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await db.variant.bulkInsert(variant_array);
    } else {
      await db.product.insert({
        id: product_id,
        active: parseInt(stock) >= 1 ? true : false,
        name,
        description,
        image,
        by,
        price: parseInt(price as string),
        stock: parseInt(stock as string),
        sku,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
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
      variant: variants,
      removeVariantID,
    } = data;

    const queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    const removeVariant = async (variantsID: string[]) => {
      await variantsID.map(async (id: string) => {
        const queryVariant = await db.variant.findOne(id).exec();
        await queryVariant.remove();
        await queryProduct.incrementalModify((prev: any) => {
          const index = prev.variant.indexOf(id);

          prev.variant.splice(index, 1);

          return prev;
        });

        const queryBundles = await db.bundle.find({
          selector: {
            product: {
              $elemMatch: {
                variant_id: id,
              },
            }
          },
        }).exec();

        await queryBundles.map(async (bundle: any) => {
          await bundle.incrementalModify((prev: any) => {
            const index = prev.product.findIndex((data: any) => data.variant_id === id);

            prev.product.splice(index, 1);

            const inactive = prev.product.filter((data: any) => data.active === false);

            prev.active = inactive.length ? false : true;

            return prev;
          });
        });
      });
    };

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
      /**
       * 1.1 Check if the product already exist in a bundle.
       *
       * If there are any bundle that contain the product without variant, throw error until the product removed from
       * every bundle.
       */
      const queryBundles = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
              variant_id: undefined,
            },
          }
        },
      }).exec();

      if (queryBundles.length) {
        throw `Cannot add new variant into this product since this product already included in some bundle, please remove it from the bundle first.`;
      }

      // 1.2 Update the product detail.
      const is_stocked = variants.filter((variant: any) => parseInt(variant.stock) !== 0).length;

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

      /**
       * 1.3 Check if there are any variant removed.
       *
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      if (removeVariantID.length) {
        await removeVariant(removeVariantID);
      }

      // 1.4 Looping to update every variants detail.
      await variants.map(async (variant: any) => {
        const {
          id: v_id,
          name: v_name,
          image: v_image,
          price: v_price,
          stock: v_stock,
          sku: v_sku,
        } = variant;

        // 1.4.1 Update variant detail if it's originally has an id.
        if (v_id) {
          const queryVariant = await db.variant.findOne({
            selector: {
              id: {
                $eq: v_id,
              },
            }
          }).exec();

          // 1.4.1.1 Update current variant detail.
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

          // 1.4.1.2 Update any bundle that contains current variant as one of it's product.
          await updateBundles({ id: v_id, stock: parseInt(v_stock), isVariant: true });
        }
        // 1.4.2 Add new variant since it's doesnt have an id.
        else {
          // 1.4.2.1 Create new variant and added it to collection.
          const ulid = monotonicFactory();

          const variant_id = 'VAR_' + ulid();

          await db.variant.insert({
            id: variant_id,
            product_id: id,
            active: v_stock >= 1 ? true : false,
            name: v_name,
            image: v_image,
            price: parseInt(v_price),
            stock: parseInt(v_stock),
            sku: v_sku,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          // 1.4.2.2 Add currently added variant into list of variant on current product.
          await queryProduct.incrementalModify((prev: any) => {
            prev.variant.push(variant_id);

            return prev;
          });
        }
      });
    }
    /**
     * 2. Update flow if product has no variants.
     *
     * This also run when product has actual variants, BUT if those variants are removed in
     * the editing proces.
     */
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

      /**
       * 2.2 Check if there are any variant removed.
       *
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      if (removeVariantID.length) {
        await removeVariant(removeVariantID);
      }

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

export const mutateDeleteProduct = async (id: string) => {
  try {
    const queryProduct = await db.product.findOne(id).exec();
    const { variant } = queryProduct;

    const removeFromBundles = async (bundles: []) => {
      bundles.map(async (bundle: any) => {
        await bundle.incrementalModify((prev: any) => {
          const index = prev.product.findIndex((data: any) => data.id === id);

          prev.product.splice(index, 1);

          if (prev.product.length) {
            const inactive = prev.product.filter((data: any) => data.active === false);

            prev.active = inactive.length ? false : true;
          } else {
            prev.active = false;
          }

          return prev;
        });
      });
    };

    // 1. Delete flow for product with variant.
    if (variant.length) {
      // 1.1 Remove the product.
      await queryProduct.remove();

      // 1.2 Get list of variant of current product and delete it.
      const queryVariant = await db.variant.find({
        selector: {
          product_id: id,
        },
      });

      await queryVariant.remove();

      // 1.3 Get list of bundle that contain current deleted product id and as one of it's product.
      const queryBundle = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
            }
          }
        }
      }).exec();

      // 1.4 Recursively delete current product variant in each bundle that has the same id with currently deleted product id.
      await removeFromBundles(queryBundle);
    }
    // 2. Delete flow for product without variant.
    else {
      // 2.1 Remove the product
      await queryProduct.remove();

      // 2.2 Get list of bundle that contain current deleted product as one of it's product.
      const queryBundle = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
              variant_id: undefined,
            },
          },
        },
      }).exec();

      // 2.3 Recursively delete current deleted product id from list of product on each bundle.
      await removeFromBundles(queryBundle);
    };
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
    const productID = 'PRD_' + ulid();
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
      id: 'BND_' + ulid(),
      active: available,
      name: 'Bundle 1',
      description: 'Bundle 1 description',
      product: productArr,
      price: price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'BND_' + ulid(),
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
