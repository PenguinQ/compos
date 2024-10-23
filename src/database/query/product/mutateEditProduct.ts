import { monotonicFactory } from 'ulidx';
import { sanitize } from 'isomorphic-dompurify';
import Big from 'big.js';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

// Common Helpers
import { isNumeric, sanitizeNumeric } from '@/helpers';

type MutateEditProductQueryVariant = {
  id?: string;
  name: string;
  price: string;
  stock: number;
  sku?: string;
  new_images: File[];
  deleted_images: string[],
};

type MutateEditProductQueryData = {
  name: string;
  description?: string;
  by?: string;
  price: string;
  stock: number;
  sku?: string;
  new_images?: File[];
  deleted_images?: string[];
  variants?: MutateEditProductQueryVariant[];
  deleted_variants?: string[];
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
        if (prev.variants) {
          const index = prev.variants.indexOf(id);

          prev.variants.splice(index, 1);
        }

        return prev;
      });
    }
  }
};

const updateBundlePrice = async ({ id, old_price, new_price }: { id: string; old_price: string; new_price: string; }) => {
  const _queryBundles = await db.bundle.find({
    selector: {
      products: {
        $elemMatch: {
          id,
        },
      }
    },
  }).exec();

  for (const bundle of _queryBundles) {
    await bundle.incrementalModify(prev => {
      prev.price = Big(prev.price).minus(old_price).plus(new_price).toString();

      console.log(prev.price);

      return prev;
    });
  }
};

const updateBundlesStatus = async ({ id, active }: { id: string; active: boolean; }) => {
  const _queryBundles = await db.bundle.find({
    selector: {
      products: {
        $elemMatch: {
          id,
        },
      }
    },
  }).exec();

  for (const bundle of _queryBundles) {
    console.log(bundle);

    await bundle.incrementalModify(prev => {
      const index = prev.products.findIndex(data => data.id === id);

      prev.products[index].active = active;

      const inactive = prev.products.filter(data => data.active === false);

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
      price            = '0',
      stock            = 0,
      new_images       = [],
      variants         = [],
      deleted_images   = [],
      deleted_variants = [],
    } = data;
    const clean_name        = sanitize(name);
    const clean_by          = by && sanitize(by);
    const clean_description = description && sanitize(description);
    const clean_sku         = sku && sanitize(sku);

    if (clean_name.trim() === '') throw 'Name cannot be empty.';
    if (!isNumeric(price))        throw 'Price must be a number.';
    if (!isNumeric(stock))        throw 'Stock must be a number.';

    // OLD
    // const clean_price = parseInt(price);
    // const clean_stock = parseInt(stock as unknown as string);
    const clean_price = sanitizeNumeric(price) as string;
    const clean_stock = sanitizeNumeric(stock) as number;

    const _queryProduct = await db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    }).exec();

    if (!_queryProduct) throw `Cannot find product with id ${id}.`;

    /**
     * ---------------------------------------
     * 1. Update flow if product has variants.
     * ---------------------------------------
     */
    if (variants.length) {
      /**
       * ----------------------------------------------------
       * 1.1. Check if the product already exist in a bundle.
       * ----------------------------------------------------
       * If there are any bundle that contain the product where this product doesn't have any variant, throw error until the product removed from
       * every bundle.
       */
      const _queryBundles = await db.bundle.find({
        selector: {
          products: {
            $elemMatch: {
              id,
            },
          }
        },
      }).exec();

      if (_queryBundles.length) throw `Cannot add new variant into this product since this product already included in some bundle, please remove it from the bundle first.`;

      /**
       * -------------------------------
       * 1.2. Update the product detail.
       * -------------------------------
       */
      const is_stocked = variants.filter(variant => variant.stock !== 0).length;

      await _queryProduct.update({
        $set: {
          name       : clean_name,
          description: clean_description,
          by         : clean_by,
          sku        : clean_sku,
          active     : is_stocked ? true : false,
          price      : '0',
          stock      : 0,
          updated_at : new Date().toISOString(),
        },
      });

      /**
       * ---------------------------
       * 1.3. Update product images.
       * ---------------------------
       */
      if (deleted_images.length) await removeImages(deleted_images, _queryProduct);

      if (new_images.length) {
        if (!isImagesValid(new_images)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_images);
        const product_attachments    = _queryProduct.allAttachments();

        if (product_attachments.length) await removeCurrentImage(_queryProduct);
        if (thumbnails.length)          await addImages(thumbnails, _queryProduct as RxDocument<unknown>);
        if (images.length)              await addImages(images, _queryProduct as RxDocument<unknown>);
      }

      /**
       * --------------------------------------------
       * 1.4. Check if there are any variant removed.
       * --------------------------------------------
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      if (deleted_variants.length) await removeVariant(deleted_variants, _queryProduct);

      /**
       * --------------------------------------------
       * 1.5. Iterate and update each variant detail.
       * --------------------------------------------
       */
      for (const variant of variants) {
        const {
          id            : v_id,
          name          : v_name,
          sku           : v_sku,
          price         : v_price          = '0',
          stock         : v_stock          = 0,
          new_images    : v_new_images     = [],
          deleted_images: v_deleted_images = [],
        } = variant;
        const clean_v_name = sanitize(v_name);
        const clean_v_sku  = v_sku && sanitize(v_sku);

        if (clean_v_name.trim() === '') throw 'Variant name cannot be empty.';
        if (!isNumeric(v_price))        throw 'Variant price must be a number.';
        if (!isNumeric(v_stock))        throw 'Variant stock must be a number.';

        // OLD
        // const clean_v_price = parseInt(v_price as unknown as string);
        // const clean_v_stock = parseInt(v_stock as unknown as string);
        const clean_v_price = sanitizeNumeric(v_price) as string;
        const clean_v_stock = sanitizeNumeric(v_stock) as number;
        const v_is_active   = clean_v_stock >= 1 ? true : false;

        /**
         * -------------------------------------
         * 1.5.1. Check for existing variant ID.
         * -------------------------------------
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
           * ---------------------------------------------------
           * 1.5.1.1. Update current iteration variation detail.
           * ---------------------------------------------------
           */
          await _queryVariant.update({
            $set: {
              active    : v_is_active,
              name      : clean_v_name,
              sku       : clean_v_sku,
              price     : clean_v_price,
              stock     : clean_v_stock,
              updated_at: new Date().toISOString(),
            },
          });

          const updated_variant = _queryVariant.getLatest();

          /**
           * ---------------------------------------------------
           * 1.5.1.2. Update current iteration variation images.
           * ---------------------------------------------------
           */
          if (v_deleted_images.length) await removeImages(v_deleted_images, _queryVariant);

          if (v_new_images.length) {
            if (!isImagesValid(v_new_images)) throw 'Invalid file types.';

            const { thumbnails, images } = await compressProductImage(v_new_images);
            const variant_attachments    = _queryVariant.allAttachments();

            if (variant_attachments.length) await removeCurrentImage(_queryVariant);
            if (thumbnails.length)          await addImages(thumbnails, _queryVariant as RxDocument<unknown>);
            if (images.length)              await addImages(images, _queryVariant as RxDocument<unknown>);
          }

          /**
           * ------------------------------------------------------------------------------------------------
           * 1.5.1.3. Update any bundle price that contains current variant iteration as one of it's product.
           * ------------------------------------------------------------------------------------------------
           */
          if (_queryVariant.price !== updated_variant.price) {
            await updateBundlePrice({ id: v_id, old_price: _queryVariant.price, new_price: updated_variant.price });
          }

          /**
           * -------------------------------------------------------------------------------------------------
           * 1.5.1.4. Update any bundle status that contains current variant iteration as one of it's product.
           * -------------------------------------------------------------------------------------------------
           * * Update bundle if:
           * - Previous stock is equal to 0 and new stock is more than 0
           * - Previous stock is more than 0 and new stock is equal to 0
           *
           * This to update active status of each variant on the bundle.
           */
          if (
            _queryVariant.stock === 0 && updated_variant.stock > 0 ||
            _queryVariant.stock > 0 && updated_variant.stock === 0
          ) {
            await updateBundlesStatus({ id: v_id, active: v_is_active });
          }
        }
        /**
         * ---------------------------------
         * 1.5.2. Doesn't have a variant ID.
         * ---------------------------------
         * If current variant iteration doesn't have an ID, create new variant for the product.
         */
        else {
          /**
           * ----------------------------
           * 1.5.2.1. Create new variant.
           * ----------------------------
           */
          const ulid       = monotonicFactory();
          const variant_id = VARIANT_ID_PREFIX + ulid();

          const _queryVariant = await db.variant.insert({
            active    : v_is_active,
            id        : variant_id,
            product_id: id,
            name      : clean_v_name,
            sku       : clean_v_sku,
            price     : clean_v_price,
            stock     : clean_v_stock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          /**
           * ---------------------------------------------
           * 1.5.2.2. Add images to newly created variant.
           * ---------------------------------------------
           */
          if (v_new_images.length) {
            if (!isImagesValid(v_new_images)) throw 'Invalid file types.';

            const { thumbnails, images } = await compressProductImage(v_new_images);

            if (thumbnails.length) await addImages(thumbnails, _queryVariant as RxDocument<unknown>);
            if (images.length)     await addImages(images, _queryVariant as RxDocument<unknown>);
          }

          /**
           * -----------------------------------------------------------------------------
           * 1.5.2.3. Add currently added variant into list of variant on current product.
           * -----------------------------------------------------------------------------
           */
          await _queryProduct.incrementalModify(prev => {
            if (prev.variants) prev.variants.push(variant_id);

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
       * -------------------------------
       * 2.1. Update the product detail.
       * -------------------------------
       */
      const is_active = clean_stock >= 1 ? true : false;

      await _queryProduct.update({
        $set: {
          active     : is_active,
          name       : clean_name,
          description: clean_description,
          by         : clean_by,
          sku        : clean_sku,
          price      : clean_price,
          stock      : clean_stock,
          updated_at : new Date().toISOString(),
        },
      });

      const updated_product = _queryProduct.getLatest();

      /**
       * -------------------------------
       * 2.2. Update the product images.
       * -------------------------------
       */
      if (deleted_images.length) await removeImages(deleted_images, _queryProduct);

      if (new_images.length) {
        if (!isImagesValid(new_images)) throw 'Invalid file types.';

        const { thumbnails, images } = await compressProductImage(new_images);
        const product_attachments    = _queryProduct.allAttachments();

        if (product_attachments.length) await removeCurrentImage(_queryProduct);
        if (thumbnails.length)          await addImages(thumbnails, _queryProduct as RxDocument<unknown>);
        if (images.length)              await addImages(images, _queryProduct as RxDocument<unknown>);
      }

      /**
       * --------------------------------------------
       * 2.3. Check if there are any variant removed.
       * --------------------------------------------
       * If there are any deleted variant id in the array, remove variant from the collection and the product,
       * then remove the variant from any bundle.
       */
      if (deleted_variants.length) await removeVariant(deleted_variants, _queryProduct);

      /**
       * ---------------------------------------------------------------------------------------
       * 2.4. Update any bundle price price that contains current productas one of it's product.
       * ---------------------------------------------------------------------------------------
       */
      if (_queryProduct.price !== updated_product.price) {
        await updateBundlePrice({ id, old_price: _queryProduct.price, new_price: updated_product.price });
      }

      /**
       * -----------------------------------------------------------------------------------
       * 2.5. Update any bundle status that contains current product as one of it's product.
       * -----------------------------------------------------------------------------------
       * Update bundle if:
       * - Previous stock is equal to 0 and new stock is more than 0
       * - Previous stock is more than 0 and new stock is equal to 0
       *
       * This to update active status of each product on the bundle.
       */
      if (
        _queryProduct.stock === 0 && updated_product.stock > 0 ||
        _queryProduct.stock > 0 && updated_product.stock === 0
      ) {
        await updateBundlesStatus({ id, active: is_active });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
