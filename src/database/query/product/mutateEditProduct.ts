import { monotonicFactory } from 'ulidx';
import { sanitize } from 'isomorphic-dompurify';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { isNumeric } from '@/helpers';
import { THUMBNAIL_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

type MutateEditProductQueryVariant = {
  id?: string;
  name: string;
  price: number;
  stock: number;
  sku?: string;
  new_image: File[];
  deleted_image: string[],
};

type MutateEditProductQueryData = {
  name: string;
  description?: string;
  by?: string;
  price: number;
  stock: number;
  sku?: string;
  new_image?: File[];
  variant?: MutateEditProductQueryVariant[];
  deleted_image?: string[];
  deleted_variant?: string[];
};

type MutateEditProductQuery = {
  id: string;
  data: MutateEditProductQueryData;
};

const removeImages = async (images: string[], doc: RxDocument<ProductDoc> | RxDocument<VariantDoc>) => {
  for (const id of images) {
    const image     = doc.getAttachment(id);
    const thumbnail = doc.getAttachment(THUMBNAIL_ID_PREFIX + id.split('_')[1]);

    if (image) await image.remove();
    if (thumbnail) await thumbnail.remove();
  }
};

const removeCurrentImage = async (query: RxDocument<ProductDoc> | RxDocument<VariantDoc>) => {
  const images = query.allAttachments();

  for (const image of images) await image.remove();
};

const removeVariant = async (variantsID: string[], product: RxDocument<ProductDoc>) => {
  for (const id of variantsID) {
    const _queryVariant = await db.variant.findOne(id).exec();

    if (_queryVariant) {
      await _queryVariant.remove();

      await product.incrementalModify(prev => {
        if (prev.variant) {
          const index = prev.variant.indexOf(id);

          prev.variant.splice(index, 1);
        }

        return prev;
      });
    }

    const _queryBundles = await db.bundle.find({
      selector: {
        product: {
          $elemMatch: {
            variant_id: id,
          },
        }
      },
    }).exec();

    for (const bundle of _queryBundles) {
      await bundle.incrementalModify(prev => {
        const index = prev.product.findIndex(data => data.variant_id === id);

        prev.product.splice(index, 1);

        const inactive = prev.product.filter(data => data.active === false);

        prev.active = inactive.length ? false : true;

        return prev;
      });
    }
  }
};

const updateBundles = async ({
  id,
  stock,
  isVariant = false
}: {
  id: string;
  stock: number;
  isVariant?: boolean;
}) => {
  const queryKey = isVariant ? 'variant_id' : 'id';
  const _queryBundles = await db.bundle.find({
    selector: {
      product: {
        $elemMatch: {
          [queryKey]: id,
        },
      }
    },
  }).exec();

  for (const bundle of _queryBundles) {
    await bundle.incrementalModify(prev => {
      const index = prev.product.findIndex(data => data[queryKey] === id);

      prev.product[index].active = stock >= 1 ? true : false;

      const inactive = prev.product.filter(data => data.active === false);

      prev.active     = inactive.length ? false : true;
      prev.updated_at = new Date().toISOString();

      return prev;
    });
  }
};

export default async ({ id, data }: MutateEditProductQuery) => {
  try {
    const {
      name,
      by,
      description,
      sku,
      price             = 0,
      stock             = 0,
      new_image         = [],
      variant: variants = [],
      deleted_image     = [],
      deleted_variant   = [],
    } = data;
    const clean_name        = sanitize(name);
    const clean_by          = by && sanitize(by);
    const clean_description = description && sanitize(description);
    const clean_sku         = sku && sanitize(sku);

    if (clean_name.trim() === '') throw 'Name cannot be empty.';
    if (!isNumeric(price))        throw 'Price must be a number.';
    if (!isNumeric(stock))        throw 'Stock must be a number.';

    const _queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    if (!_queryProduct) throw `Cannot find product with id ${id}.`;

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

      if (_queryBundles.length) throw `Cannot add new variant into this product since this product already included in some bundle, please remove it from the bundle first.`;

      /**
       * ------------------------------
       * 1.2 Update the product detail.
       * ------------------------------
       */
      const is_stocked = variants.filter(variant => variant.stock !== 0).length;

      await _queryProduct.update({
        $set: {
          name       : clean_name,
          description: clean_description,
          by         : clean_by,
          sku        : clean_sku,
          active     : is_stocked ? true : false,
          price      : 0,
          stock      : 0,
          updated_at : new Date().toISOString(),
        },
      });

      /**
       * --------------------------
       * 1.3 Update product images.
       * --------------------------
       */
      if (deleted_image.length) await removeImages(deleted_image, _queryProduct);

      if (new_image.length) {
        if (!isImagesValid(new_image)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_image);
        const product_attachments    = _queryProduct.allAttachments();

        if (product_attachments.length) await removeCurrentImage(_queryProduct);
        if (thumbnails.length)          await addImages(thumbnails, _queryProduct);
        if (images.length)              await addImages(images, _queryProduct);
      }

      /**
       * -------------------------------------------
       * 1.4 Check if there are any variant removed.
       * -------------------------------------------
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      if (deleted_variant.length) await removeVariant(deleted_variant, _queryProduct);

      /**
       * -------------------------------------------
       * 1.5 Iterate and update each variant detail.
       * -------------------------------------------
       */
      for (const variant of variants) {
        const {
          id           : v_id,
          name         : v_name,
          sku          : v_sku,
          price        : v_price         = 0,
          stock        : v_stock         = 0,
          new_image    : v_new_image     = [],
          deleted_image: v_deleted_image = [],
        } = variant;
        const clean_v_name = sanitize(v_name);
        const clean_v_sku  = v_sku && sanitize(v_sku);

        if (clean_v_name.trim() === '') throw 'Variant name cannot be empty.';
        if (!isNumeric(v_price))        throw 'Variant price must be a number.';
        if (!isNumeric(v_stock))        throw 'Variant stock must be a number.';

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

          if (!_queryVariant) throw `Cannot find product variant with id ${id}.`;

          /**
           * --------------------------------------------------
           * 1.5.1.1 Update current iteration variation detail.
           * --------------------------------------------------
           */
          await _queryVariant.update({
            $set: {
              active    : v_stock > 0 ? true : false,
              name      : clean_v_name,
              sku       : clean_v_sku,
              price     : v_price,
              stock     : v_stock,
              updated_at: new Date().toISOString(),
            },
          });

          /**
           * --------------------------------------------------
           * 1.5.1.2 Update current iteration variation images.
           * --------------------------------------------------
           */
          if (v_deleted_image.length) await removeImages(v_deleted_image, _queryVariant);

          if (v_new_image.length) {
            if (!isImagesValid(v_new_image)) throw 'Invalid file types.';

            const { thumbnails, images } = await compressProductImage(v_new_image);
            const variant_attachments    = _queryVariant.allAttachments();

            if (variant_attachments.length) await removeCurrentImage(_queryVariant);
            if (thumbnails.length)          await addImages(thumbnails, _queryVariant);
            if (images.length)              await addImages(images, _queryVariant);
          }

          /**
           * -----------------------------------------------------------------------------------------
           * 1.5.1.3 Update any bundle that contains current variant iteration as one of it's product.
           * -----------------------------------------------------------------------------------------
           */
          await updateBundles({ id: v_id, stock: v_stock, isVariant: true });
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
          const ulid       = monotonicFactory();
          const variant_id = VARIANT_ID_PREFIX + ulid();

          const _queryVariant = await db.variant.insert({
            id        : variant_id,
            product_id: id,
            active    : v_stock >= 1 ? true : false,
            name      : clean_v_name,
            sku       : clean_v_sku,
            price     : v_price,
            stock     : v_stock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          /**
           * --------------------------------------------
           * 1.5.2.2 Add images to newly created variant.
           * --------------------------------------------
           */
          if (v_new_image.length) {
            if (!isImagesValid(v_new_image)) throw 'Invalid file types.';

            const { thumbnails, images } = await compressProductImage(v_new_image);

            if (thumbnails.length) await addImages(thumbnails, _queryVariant);
            if (images.length)     await addImages(images, _queryVariant);
          }

          /**
           * ----------------------------------------------------------------------------
           * 1.5.2.3 Add currently added variant into list of variant on current product.
           * ----------------------------------------------------------------------------
           */
          await _queryProduct.incrementalModify(prev => {
            if (prev.variant) prev.variant.push(variant_id);

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
          name       : clean_name,
          description: clean_description,
          by         : clean_by,
          sku        : clean_sku,
          active     : stock >= 1 ? true : false,
          price      : price,
          stock      : stock,
          updated_at : new Date().toISOString(),
        },
      });

      /**
       * ------------------------------
       * 2.2 Update the product images.
       * ------------------------------
       */
      if (deleted_image.length) await removeImages(deleted_image, _queryProduct);

      if (new_image.length) {
        if (!isImagesValid(new_image)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_image);
        const product_attachments    = _queryProduct.allAttachments();

        if (product_attachments.length) await removeCurrentImage(_queryProduct);
        if (thumbnails.length)          await addImages(thumbnails, _queryProduct);
        if (images.length)              await addImages(images, _queryProduct);
      }

      /**
       * -------------------------------------------
       * 2.3 Check if there are any variant removed.
       * -------------------------------------------
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      deleted_variant.length && await removeVariant(deleted_variant, _queryProduct);

      /**
       * ---------------------------------------------------------------------------
       * 2.4 Update any bundle that contains current product as one of it's product.
       * ---------------------------------------------------------------------------
       */
      await updateBundles({ id, stock });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
