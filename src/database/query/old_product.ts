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
    const _queryProduct  = await db.product.findOne({ selector: { id } }).exec();
    const _queryVariants = await _queryProduct.populate('variant');

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
