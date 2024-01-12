import { createBlob } from 'rxdb';
import { monotonicFactory } from 'ulidx';

import { db } from '@database';

export const getProductDetail = async ({ id, normalizer }: any) => {
  try {
    const queryProduct              = await db.product.findOne({ selector: { id } }).exec();
    const queryProductAttachments   = await queryProduct.allAttachments();
    const queryVariants             = await queryProduct.populate('variant');

    /**
     * ---------------------------
     * 1. Set product detail data.
     * ---------------------------
     */
    const { ...productData }            = queryProduct.toJSON();
    const product_attachments: object[] = [];
    const product_data                  = { attachment: product_attachments, ...productData };

    for (const attachment of queryProductAttachments) {
      const { id } = attachment;
      const data   = await attachment.getData();

      product_attachments.push({ id, data });
    }

    /**
     * ---------------------------
     * 2. Set variant detail data.
     * ---------------------------
     */
    const variant_data = [];

    for (const variant of queryVariants) {
      const { ...variantData }      = variant.toJSON();
      const queryVariantAttachments = await variant.allAttachments();
      const variant_attachments     = [];

      for (const attachment of queryVariantAttachments) {
        const { id } = attachment;
        const data   = await attachment.getData();

        variant_attachments.push({ id, data });
      }

      variant_data.push({ attachment: variant_attachments, ...variantData });
    }

    return {
      result: normalizer({ product: product_data, variant: variant_data }),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateAddProduct = async ({ data }: any) => {
  try {
    const ulid       = monotonicFactory();
    const product_id = 'PRD_' + ulid();
    const {
      name,
      description,
      new_image,
      by,
      price,
      stock,
      sku,
      variant,
    } = data;

    /**
     * ---------------------------------
     * 1. Add flow if there's a variant.
     * ---------------------------------
     */
    if (variant.length) {
      let product_active             = true;
      const variant_array: any       = [];
      const variant_ids: string[]    = [];
      const variant_attachments: any = [];

      variant.map((v: any) => {
        const variant_id = 'VAR_' + ulid();

        variant_array.push({
          id        : variant_id,
          product_id: product_id,
          active    : parseInt(v.stock) >= 1 ? true : false,
          name      : v.name,
          price     : parseInt(v.price),
          stock     : parseInt(v.stock),
          sku       : v.sku,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        variant_ids.push(variant_id);
        variant_attachments.push(v.new_image);
      });

      const inactiveVariant = variant_array.filter((v: any) => v.active === false);

      if (inactiveVariant.length === variant_array.length) {
        product_active = false;
      }

      /**
       * -----------------------
       * 1.1 Insert the product.
       * -----------------------
       */
      const productQuery = await db.product.insert({
        id         : product_id,
        active     : product_active,
        variant    : variant_ids,
        price      : 0,
        stock      : 0,
        sku        : data.sku,
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        name,
        description,
        by,
      });

      /**
       * ------------------------------
       * 1.2 Insert the product images.
       * ------------------------------
       */
      const product_attachments = new_image;

      if (product_attachments.length) {
        await product_attachments.map(async (attachment: File) => {
          const attachmentID = `IMG_${ulid()}`;
          const { type }     = attachment;
          const imageBlob    = createBlob(attachment as any, type);

          await productQuery.putAttachment({ id: attachmentID, data: imageBlob, type });
        });
      }

      /**
       * --------------------------------
       * 1.3 Insert the product variants.
       * --------------------------------
       */
      const variantQuery = await db.variant.bulkInsert(variant_array);
      const { success: variants }  = variantQuery;

      /**
       * ---------------------------------------
       * 1.4 Insert the images of each variants.
       * ---------------------------------------
       */
      if (variants.length) {
        await variants.map(async (variant: any, index: number) => {
          if (variant_attachments[index].length) {
            await variant_attachments[index].map(async (attachment: File) => {
              const attachmentID = `IMG_${ulid()}`;
              const { type }     = attachment;
              const imageBlob    = createBlob(attachment as any, type);

              await variant.putAttachment({ id: attachmentID, data: imageBlob, type });
            });
          }
        });
      }
    }
    /**
     * ----------------------------------
     * 2. Add flow if there's no variant.
     * ----------------------------------
     */
    else {
      /**
       * ------------------------
       * 2.1. Insert the product.
       * ------------------------
       */
      const productQuery = await db.product.insert({
        id         : product_id,
        active     : parseInt(stock) >= 1 ? true : false,
        price      : parseInt(price as string),
        stock      : parseInt(stock as string),
        created_at : new Date().toISOString(),
        updated_at : new Date().toISOString(),
        variant,
        name,
        description,
        by,
        sku,
      });

      /**
       * -------------------------------
       * 2.1. Insert the product images.
       * -------------------------------
       */
      if (new_image.length) {
        await new_image.map(async (attachment: File) => {
          const attachmentID = `IMG_${ulid()}`;
          const { type }     = attachment;
          const imageBlob    = createBlob(attachment as any, type);

          await productQuery.putAttachment({ id: attachmentID, data: imageBlob, type });
        });
      }
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
    const ulid = monotonicFactory();
    const {
      name,
      description,
      by,
      price,
      stock,
      sku,
      new_image,
      variant: variants,
      deleted_image,
      deleted_variant,
    } = data;

    const queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    const removeVariant = async (variantsID: string[]) => {
      variantsID.map(async (id: string) => {
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

          prev.active     = inactive.length ? false : true;
          prev.updated_at = new Date().toISOString();

          return prev;
        });
      });
    };

    const updateImages = async (new_image: File[], deleted_image: string[], query: any) => {
      if (new_image.length) {
        new_image.map(async (attachment: File) => {
          const attachmentID = `IMG_${ulid()}`;
          const { type }     = attachment;
          const imageBlob    = createBlob(attachment as any, type);

          await query.putAttachment({ id: attachmentID, data: imageBlob, type });
        });
      }

      if (deleted_image.length) {
        deleted_image.map(async (id: string) => {
          const attachment = query.getAttachment(id);

          await attachment.remove();
        });
      }
    };

    /**
     * --------------------------------------
     * 1. Update flow if product has variants
     * --------------------------------------
     */
    if (variants.length) {
      /**
       * ---------------------------------------------------
       * 1.1 Check if the product already exist in a bundle.
       * ---------------------------------------------------
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

      /**
       * ------------------------------
       * 1.2 Update the product detail.
       * ------------------------------
       */
      const is_stocked = variants.filter((variant: any) => parseInt(variant.stock) !== 0).length;

      await queryProduct.update({
        $set: {
          updated_at: new Date().toISOString(),
          active    : is_stocked ? true : false,
          name,
          description,
          price: 0,
          stock: 0,
          by,
          sku,
        },
      });

      /**
       * --------------------------
       * 1.3 Update product images.
       * --------------------------
       */
      await updateImages(new_image, deleted_image, queryProduct);

      /**
       * -------------------------------------------
       * 1.4 Check if there are any variant removed.
       * -------------------------------------------
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      deleted_variant.length && await removeVariant(deleted_variant);

      /**
       * -------------------------------------------
       * 1.5 Iterate and update each variant detail.
       * -------------------------------------------
       */
      await variants.map(async (variant: any) => {
        const {
          id           : v_id,
          name         : v_name,
          price        : v_price,
          stock        : v_stock,
          sku          : v_sku,
          new_image    : v_new_image,
          deleted_image: v_deleted_image,
        } = variant;

        /**
         * ------------------------------------
         * 1.5.1 Check for existing variant ID.
         * ------------------------------------
         * If current variant iteration has existing ID (or variant currently exist), update the detail.
         */
        if (v_id) {
          const queryVariant = await db.variant.findOne({
            selector: {
              id: {
                $eq: v_id,
              },
            }
          }).exec();

          /**
           * --------------------------------------------------
           * 1.5.1.1 Update current iteration variation detail.
           * --------------------------------------------------
           */
          await queryVariant.update({
            $set: {
              active    : parseInt(v_stock) > 0 ? true : false,
              name      : v_name,
              price     : parseInt(v_price),
              stock     : parseInt(v_stock),
              sku       : v_sku,
              updated_at: new Date().toISOString(),
            },
          });

          /**
           * --------------------------------------------------
           * 1.5.1.2 Update current iteration variation images.
           * --------------------------------------------------
           */
          await updateImages(v_new_image, v_deleted_image, queryVariant);

          /**
           * -----------------------------------------------------------------------------------------
           * 1.5.1.3 Update any bundle that contains current variant iteration as one of it's product.
           * -----------------------------------------------------------------------------------------
           */
          await updateBundles({ id: v_id, stock: parseInt(v_stock), isVariant: true });
        }
        /**
         * --------------------------------
         * 1.5.2 Doesn't have a variant ID.
         * --------------------------------
         * If current variant iteration doesn't have an ID, create new variant for the product.
         */
        else {
          /**
           * ---------------------------
           * 1.5.2.1 Create new variant.
           * ---------------------------
           */
          const ulid = monotonicFactory();

          const variant_id = 'VAR_' + ulid();

          const queryVariant = await db.variant.insert({
            id        : variant_id,
            product_id: id,
            active    : v_stock >= 1 ? true : false,
            name      : v_name,
            price     : parseInt(v_price),
            stock     : parseInt(v_stock),
            sku       : v_sku,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          /**
           * --------------------------------------------
           * 1.5.2.2 Add images to newly created variant.
           * --------------------------------------------
           */
          await updateImages(v_new_image, [], queryVariant);

          /**
           * ----------------------------------------------------------------------------
           * 1.5.2.3 Add currently added variant into list of variant on current product.
           * ----------------------------------------------------------------------------
           */
          await queryProduct.incrementalModify((prev: any) => {
            prev.variant.push(variant_id);

            return prev;
          });
        }
      });
    }
    /**
     * ------------------------------------------
     * 2. Update flow if product has no variants.
     * ------------------------------------------
     * This also run when product has actual variants, BUT if those variants are removed in the editing process.
     */
    else {
      /**
       * ------------------------------
       * 2.1 Update the product detail.
       * ------------------------------
       */
      await queryProduct.update({
        $set: {
          active    : parseInt(stock) >= 1 ? true : false,
          price     : parseInt(price),
          stock     : parseInt(stock),
          updated_at: new Date().toISOString(),
          name,
          description,
          by,
          sku,
        },
      });

      /**
       * ------------------------------
       * 2.2 Update the product images.
       * ------------------------------
       */
      await updateImages(new_image, deleted_image, queryProduct);

      /**
       * -------------------------------------------
       * 2.3 Check if there are any variant removed.
       * -------------------------------------------
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      deleted_variant.length && await removeVariant(deleted_variant);

      /**
       * ---------------------------------------------------------------------------
       * 2.4 Update any bundle that contains current product as one of it's product.
       * ---------------------------------------------------------------------------
       */
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
    const { variant }  = queryProduct;

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

    /**
     * ----------------------------------------
     * 1. Delete flow for product with variant.
     * ----------------------------------------
     */
    if (variant.length) {
      /**
       * -----------------------
       * 1.1 Remove the product.
       * -----------------------
       */
      await queryProduct.remove();

      /**
       * ----------------------------------------------
       * 1.2 Get variants of the product and delete it.
       * ----------------------------------------------
       */
      const queryVariant = await db.variant.find({
        selector: {
          product_id: id,
        },
      });

      await queryVariant.remove();

      /**
       * -------------------------------------------------------------------------------
       * 1.3 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const queryBundle = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
            }
          }
        }
      }).exec();

      /**
       * ------------------------------------------------------------------------
       * 1.4 Recursively delete currently deleted product variant in each bundle.
       * ------------------------------------------------------------------------
       */
      queryBundle.length && await removeFromBundles(queryBundle);
    }
    /**
     * -------------------------------------------
     * 2. Delete flow for product without variant.
     * -------------------------------------------
     */
    else {
      /**
       * -----------------------
       * 2.1 Remove the product.
       * -----------------------
       */
      await queryProduct.remove();

      /**
       * -------------------------------------------------------------------------------
       * 2.2 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
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

      /**
       * ----------------------------------------------------------------
       * 2.3 Recursively delete currently deleted product in each bundle.
       * ----------------------------------------------------------------
       */
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
 * -------------------------
 * DEVELOPMENT MODE FUNCTION
 * -------------------------
 * Create sample products.
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

/**
 * -------------------------
 * DEVELOPMENT MODE FUNCTION
 * -------------------------
 * Create sample bundles.
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
