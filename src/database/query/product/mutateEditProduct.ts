import { monotonicFactory } from 'ulidx';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { compressProductImage } from '@/database/utils';

const getThumbnail = (id: string, query: RxDocument<any>) => {
  const thumbnail_id = `THUMB_${id.split('_')[1]}`;
  const thumbnail    = query.getAttachment(thumbnail_id);

  return thumbnail;
};

const addImages = async (images: any[], doc: RxDocument<any>) => {
  for (const image of images) {
    const { id, data } = image;
    const { type }     = data;

    await doc.putAttachment({ id, data, type });
  }
};

export default async ({ id, data }: any) => {
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

    const removeImages = async (images: string[], doc: RxDocument<any>) => {
      for (const id of images) {
        const image     = doc.getAttachment(id);
        const thumbnail = getThumbnail(id, doc);

        if (image) await image.remove();
        if (thumbnail) await thumbnail.remove();
      }
    };

    const removeCurrentImage = async (query: RxDocument<any>) => {
      const images = query.allAttachments();

      for (const image of images) {
        await image.remove();
      }
    };

    const removeVariant = async (variantsID: string[]) => {
      for (const id of variantsID) {
        const _queryVariant = await db.variant.findOne(id).exec();

        if (_queryVariant) {
          await _queryVariant.remove();

          await _queryProduct.incrementalModify((prev: any) => {
            const index = prev.variant.indexOf(id);

            prev.variant.splice(index, 1);

            return prev;
          });
        }


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

    const _queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    if (!_queryProduct) {
      throw `Cannot find product with id ${id}, operation cancelled.`;
    }

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
      const _queryBundles = await db.bundle.find({
        selector: {
          product: {
            $elemMatch: {
              id,
              variant_id: undefined,
            },
          }
        },
      }).exec();

      if (_queryBundles.length) {
        throw `Cannot add new variant into this product since this product already included in some bundle, please remove it from the bundle first.`;
      }

      /**
       * ------------------------------
       * 1.2 Update the product detail.
       * ------------------------------
       */
      const is_stocked = variants.filter((variant: any) => parseInt(variant.stock) !== 0).length;

      await _queryProduct.update({
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
        const images                    = _queryProduct.allAttachments();

        if (images.length) await removeCurrentImage(_queryProduct);

        if (thumbnail.length) await addImages(thumbnail, _queryProduct);

        if (macrograph) await addImages(macrograph, _queryProduct);
      }

      if (deleted_image.length) await removeImages(deleted_image, _queryProduct);

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
          const _queryVariant = await db.variant.findOne({
            selector: {
              id: {
                $eq: v_id,
              },
            }
          }).exec();

          if (!_queryVariant) {
            throw `Cannot find product variant with id ${id}, operation cancelled.`;
          }

          /**
           * --------------------------------------------------
           * 1.5.1.1 Update current iteration variation detail.
           * --------------------------------------------------
           */
          await _queryVariant.update({
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
            const images = _queryVariant.allAttachments();
            const { thumbnail, macrograph } = await compressProductImage(v_new_image);

            if (images.length) await removeCurrentImage(_queryVariant);

            if (thumbnail.length) await addImages(thumbnail, _queryVariant);

            if (macrograph) await addImages(macrograph, _queryVariant);
          }

          if (v_deleted_image.length) await removeImages(v_deleted_image, _queryVariant);

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

          const _queryVariant = await db.variant.insert({
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

            if (thumbnail.length) await addImages(thumbnail, _queryVariant);

            if (macrograph) await addImages(macrograph, _queryVariant);
          }

          /**
           * ----------------------------------------------------------------------------
           * 1.5.2.3 Add currently added variant into list of variant on current product.
           * ----------------------------------------------------------------------------
           */
          await _queryProduct.incrementalModify((prev: any) => {
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
      await _queryProduct.update({
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
        const images = _queryProduct.allAttachments();
        const { thumbnail, macrograph } = await compressProductImage(new_image);

        if (images.length) await removeCurrentImage(_queryProduct);
        if (thumbnail.length) await addImages(thumbnail, _queryProduct);
        if (macrograph) await addImages(macrograph, _queryProduct);
      }

      if (deleted_image.length) await removeImages(deleted_image, _queryProduct);

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
