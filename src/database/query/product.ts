import { blobToBase64String } from 'rxdb';
import { monotonicFactory } from 'ulidx';
import type { RxDocument } from 'rxdb';

import { db } from '@database';

import { compressProductImage, handlePagination } from '../utils';
import type { GetProductList } from '../types/product';

const getThumbnail = (id: string, query: RxDocument) => {
  const thumbnail_id = `THUMB_${id.split('_')[1]}`;
  const thumbnail    = query.getAttachment(thumbnail_id);

  return thumbnail;
};

const addImages = async (images: any[], doc: RxDocument) => {
  for (const image of images) {
    const { id, data } = image;
    const { type }     = data;

    await doc.putAttachment({ id, data, type });
  }
};

/**
 * -------------------------
 * Mango Selector References
 * -------------------------
 * $lt  = less than
 * $lte = less than and equal
 * $ne  = not equal
 * $gt  = greater than
 * $gte = greater than and equal
 */
export const getProductList = async ({ search_query, page, sort, limit, normalizer }: GetProductList) => {
  try {
    const query_selector = search_query ? { name: { $regex: `.*${search_query}.*`, $options: 'i' } } : { id: { $gte: '' } };
    const query_skip     = page > 1 ? (page - 1) * limit : 0;
    const query_limit    = limit;
    const query_sort     = [{ id: sort }];
    let queryCount: number;

    /**
     * ----------------------------
     * 1. Count number of products.
     * ----------------------------
     * If search query is provided, count manually from the results of find() because RxDB doesn't
     * allow non-fully-indexed count queries.
     *
     * Ref: https://rxdb.info/rx-query.html#allowslowcount
     */
    if (search_query) {
      const _searchQuery = await db.product.find({ selector: query_selector }).exec();

      queryCount = _searchQuery.length;
    } else {
      queryCount = await db.product.count().exec();
    }

    const _queryProduct = await db.product.find({
      selector: query_selector,
      skip: query_skip,
      limit: query_limit,
      sort: query_sort,
    }).$;
    const total_page   = Math.ceil(queryCount / limit);

    /**
     * ------------------------
     * 2. Results preprocessor.
     * ------------------------
     * Custom function that thrown into useQuery since observed query doesn't return list of
     * RxDocument, so the processing need to be do at later stage.
     */
    const preprocessor = async (data: RxDocument<any>) =>{
      const result: object[] = [];
      const first_id         = data[0] ? data[0].id : '';
      const last_id          = data[data.length - 1] ? data[data.length - 1].id : '';
      let first_selector: object | undefined = first_id ? sort === 'desc' ? { id: { $gt: first_id } } : { id: { $lt: first_id } } : undefined;
      let last_selector: object | undefined  = last_id ? sort === 'desc' ? { id: { $lt: last_id } } : { id: { $gt: last_id } } : undefined;

      if (first_id && last_id && search_query) {
        const query_object = { name: { $regex: `.*${search_query}.*`, $options: 'i' } };

        if (sort === 'desc') {
          first_selector = { id: { $gt: first_id }, ...query_object };
          last_selector = { id: { $lt: last_id }, ...query_object };
        } else {
          first_selector = { id: { $lt: first_id }, ...query_object };
          last_selector = { id: { $gt: last_id }, ...query_object };
        }
      }

      /**
       * -------------------------------------------------------
       * 2.1 Get the current page position from current queries.
       * -------------------------------------------------------
       */
      const { first_page, last_page } = await handlePagination({
        collection: 'product',
        selector: { first: first_selector, last: last_selector },
        sort: [{ id: sort }],
      });

      for (const product of data) {
        const { ...productData } = product.toJSON();
        const images             = product.allAttachments();
        const thumbnail          = images.filter((att: any) => att.id.startsWith('THUMB_'));
        let product_image        = '';

        if (thumbnail.length) {
          const attachment       = await thumbnail[0].getData();
          const attachmentString = await blobToBase64String(attachment);
          const { type }         = attachment;

          product_image = `data:${type};base64,${attachmentString}`;
        }

        result.push({ image: product_image, ...productData });
      }

      return {
        first_page,
        last_page,
        total_page,
        count: queryCount,
        products: result,
      };
    };

    return {
      result: _queryProduct,
      observe: true,
      preprocessor,
      normalizer,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

type PD_I = {
  id: string;
  data: string;
}

export const getProductDetail = async ({ id, normalizer }: any) => {
  try {
    const _queryProduct              = await db.product.findOne({ selector: { id } }).exec();
    const _queryVariants             = await _queryProduct.populate('variant');

    /**
     * ---------------------------
     * 1. Set product detail data.
     * ---------------------------
     */
    const { ...productData }     = _queryProduct.toJSON();
    const product_attachments    = _queryProduct.allAttachments();
    const images                 = product_attachments.filter((att: any) => att.id.startsWith('IMG_'));
    const product_images: PD_I[] = [];
    const product_data           = { image: product_images, ...productData };

    for (const image of images) {
      const { id, type } = image;
      const image_data   = await image.getData();
      const image_base64 = await blobToBase64String(image_data);

      product_images.push({ id, data: `data:${type};base64,${image_base64}` });
    }

    /**
     * ---------------------------
     * 2. Set variant detail data.
     * ---------------------------
     */
    const variant_data = [];

    for (const variant of _queryVariants) {
      const { ...variantData }  = variant.toJSON();
      const variant_attachments = variant.allAttachments();
      const images              = variant_attachments.filter((att: any) => att.id.startsWith('IMG_'));
      const variant_images      = [];


      for (const image of images) {
        const { id, type } = image;
        const image_data   = await image.getData();
        const image_base64 = await blobToBase64String(image_data);

        variant_images.push({ id, data: `data:${type};base64,${image_base64}` });
      }

      variant_data.push({ image: variant_images, ...variantData });
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
       * ---------------------
       * 1.1. Compress images.
       * ---------------------
       */
      const { thumbnail, macrograph } = await compressProductImage(new_image);

      /**
       * ---------------------------------------------------
       * 1.2. Insert the product and it's image attachments.
       * ---------------------------------------------------
       */
      const queryProduct = await db.product.insert({
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

      if (thumbnail.length) await addImages(thumbnail, queryProduct);

      if (macrograph.length) await addImages(macrograph, queryProduct);

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
        for (const [index, variant] of variants.entries()) {
          if (variant_attachments[index].length) {
            const { thumbnail, macrograph } = await compressProductImage(variant_attachments[index]);

            if (thumbnail.length) await addImages(thumbnail, variant);

            if (macrograph.length) await addImages(macrograph, variant);
          }
        }
      }
    }
    /**
     * ----------------------------------
     * 2. Add flow if there's no variant.
     * ----------------------------------
     */
    else {
      /**
       * ---------------------
       * 2.1. Compress images.
       * ---------------------
       */
      const { thumbnail, macrograph } = await compressProductImage(new_image);

      /**
       * ---------------------------------------------------
       * 2.2. Insert the product and it's image attachments.
       * ---------------------------------------------------
       */
      const queryProduct = await db.product.insert({
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

      if (thumbnail.length) await addImages(thumbnail, queryProduct);

      if (macrograph.length) await addImages(macrograph, queryProduct);
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
      by,
      price,
      stock,
      sku,
      new_image,
      variant: variants,
      deleted_image,
      deleted_variant,
    } = data;

    const removeImages = async (images: string[], doc: RxDocument) => {
      for (const id of images) {
        const image     = doc.getAttachment(id);
        const thumbnail = getThumbnail(id, doc);

        if (image) await image.remove();
        if (thumbnail) await thumbnail.remove();
      }
    };

    const removeCurrentImage = async (query: RxDocument) => {
      const images = query.allAttachments();

      for (const image of images) {
        await image.remove();
      }
    };

    const removeVariant = async (variantsID: string[]) => {
      for (const id of variantsID) {
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

        for (const bundle of queryBundles) {
          await bundle.incrementalModify((prev: any) => {
            const index = prev.product.findIndex((data: any) => data.variant_id === id);

            prev.product.splice(index, 1);

            const inactive = prev.product.filter((data: any) => data.active === false);

            prev.active = inactive.length ? false : true;

            return prev;
          });
        }
      }
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

      for (const bundle of queryBundles) {
        await bundle.incrementalModify((prev: any) => {
          const index = prev.product.findIndex((data: any) => data[queryIdentifier] === id);

          prev.product[index].active = stock >= 1 ? true : false;

          const inactive = prev.product.filter((data: any) => data.active === false);

          prev.active     = inactive.length ? false : true;
          prev.updated_at = new Date().toISOString();

          return prev;
        });
      }
    };

    const queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

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
      if (new_image.length) {
        const { thumbnail, macrograph } = await compressProductImage(new_image);
        const images                    = queryProduct.allAttachments();

        if (images.length) await removeCurrentImage(queryProduct);

        if (thumbnail.length) await addImages(thumbnail, queryProduct);

        if (macrograph) await addImages(macrograph, queryProduct);
      }

      if (deleted_image.length) await removeImages(deleted_image, queryProduct);

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
      for (const variant of variants) {
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
          if (v_new_image.length) {
            const images = queryVariant.allAttachments();
            const { thumbnail, macrograph } = await compressProductImage(v_new_image);

            if (images.length) await removeCurrentImage(queryVariant);

            if (thumbnail.length) await addImages(thumbnail, queryVariant);

            if (macrograph) await addImages(macrograph, queryVariant);
          }

          if (v_deleted_image.length) await removeImages(v_deleted_image, queryVariant);

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
          if (v_new_image.length) {
            const { thumbnail, macrograph } = await compressProductImage(v_new_image);

            if (thumbnail.length) await addImages(thumbnail, queryVariant);

            if (macrograph) await addImages(macrograph, queryVariant);
          }

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
      }
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
      if (new_image.length) {
        const images = queryProduct.allAttachments();
        const { thumbnail, macrograph } = await compressProductImage(new_image);

        if (images.length) await removeCurrentImage(queryProduct);

        if (thumbnail.length) await addImages(thumbnail, queryProduct);

        if (macrograph) await addImages(macrograph, queryProduct);
      }

      if (deleted_image.length) await removeImages(deleted_image, queryProduct);

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
    const _queryProduct = await db.product.findOne(id).exec();
    const { variant }   = _queryProduct;

    const removeFromBundles = async (bundles: RxDocument[]) => {
      for (const bundle of bundles) {
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
      }
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
      await _queryProduct.remove();

      /**
       * ----------------------------------------------
       * 1.2 Get variants of the product and delete it.
       * ----------------------------------------------
       */
      const _queryVariant = await db.variant.find({
        selector: {
          product_id: id,
        },
      });

      await _queryVariant.remove();

      /**
       * -------------------------------------------------------------------------------
       * 1.3 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const _queryBundle = await db.bundle.find({
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
      _queryBundle.length && await removeFromBundles(_queryBundle);
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
      await _queryProduct.remove();

      /**
       * -------------------------------------------------------------------------------
       * 2.2 Get list of bundle that contain the deleted product as one of it's product.
       * -------------------------------------------------------------------------------
       */
      const _queryBundle = await db.bundle.find({
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
      await removeFromBundles(_queryBundle);
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
  const meowthString = 'iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII=';

  for (let i = 1; i < 30; i++) {
    const productID = 'PRD_' + ulid();
    const obj: any = {
      id: productID,
      active: true,
      name: `Product ${i}`,
      description: `This is description for Product ${i}`,
      // base64_image: 'data:image/webp;base64,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',
      // base64_image: 'data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAkCAIAAAB0Xu9BAAAABGdBTUEAALGPC/xhBQAAAuNJREFUWEetmD1WHDEQhDdxRMYlnBFyBIccgdQhKVcgJeQMpE5JSTd2uqnvIGpVUqmm9TPrffD0eLMzUn+qVnXPwiFd/PP6eLh47v7EaazbmxsOxjhTT88z9hV7GoNF1cUCvN7TTPv/gf/+uQPm862MWTL6fff4HfDx4S79/oVAlAUwqOmYR0rnazuFnhfOy/ErMKkcBFOr1vOjUi2MFn4nuMil6OPh5eGANLhW3y6u3aH7ijEDCxgCvzFmimvc95TekZLyMSeJC68Bkw0kqUy1K87FlpGZqsGFCyqEtQNDdFUtFctTiuhnPKNysid/WFEFLE2O102XJdEE+8IgeuGsjeJyGHm/xHvQ3JtKVsGGp85g9rK6xMHtvHO9+WACYjk5vkVM6XQ6OZubCJvTfPicYPeHO2AKFl5NuF5UK1VDUbeLxh2BcRGKTQE3irHm3+vPj6cfCod50Eqv5QxtwBQUGhZhbrGVuRia1B4MNp6edwBxld2sl1splfHCwfsvCZfrCQyWmX10djjOlWJSSy3VQlS6LmfrgNvaieRWx1LZ6s9co+P0DLsy3OdLU3lWRclQsVcHJBcUQ0k9/WVVrmpRzYQzpgAdQcAXxZzUnFX3proannrYH+Vq6KkLi+UkarH09mC8YPr2RMWOlEqFkQClsykGEv7CqCUbXcG8+SaGvJ4a8d4y6epND+pEhxoN0vWUu5ntXlFb5/JT7JfJJqoTdy9u9qc7ax3xJRHqJLADWEl23cFWl4K9fvoaCJ2BHpmJ3s3z+O0U/DmzdMjB9alWZtg4e3yxzPa7lUR7nkvxLHO9+tvJX3mtSDpwX8GajB283I8R8a7D2MhUZr1iNWdny256yYLd52DwRYBtRMvE7rsmtxIUE+zLKQCDO4jlxB6CZ8M17GhuY+XTE8vNhQiIiSE82ZsGwk1pht4ZSpT0YVpon6EvevOXXH8JxVR78QzNuamupW/7UB7wO/+7sG5V4ekXb4cL5Lyv+4IAAAAASUVORK5CYII=',
      // base64_image: 'https://toastlog.com/img/logos/logo.svg',
      // base64_image: 'https://getcssscan.com/css-checkboxes-examples/checkboxes.jpg',
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
