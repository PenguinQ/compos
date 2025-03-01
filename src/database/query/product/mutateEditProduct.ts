import { monotonicFactory } from 'ulidx';
import DOMPurify from 'isomorphic-dompurify';
import Big from 'big.js';
import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { addImages, compressProductImage, isImagesValid } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX, VARIANT_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

// Helpers
import { isNumeric, sanitizeNumeric } from '@/helpers';
import { ComPOSError } from '@/helpers/createError';

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
  price?: string;
  stock?: number;
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
    const product          = bundle.products.filter(product => product.id === id)[0];
    let   product_quantity = 0;

    if (product) {
      const { quantity } = product;

      product_quantity = quantity;
    }

    await bundle.incrementalModify(prev => {
      const old_total_price = Big(old_price).times(product_quantity);
      const new_total_price = Big(new_price).times(product_quantity);

      prev.price = Big(prev.price).minus(old_total_price).plus(new_total_price).toString();

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
    const { sanitize } = DOMPurify;
    const {
      name             = '',
      price            = '0',
      stock            = 0,
      new_images       = [],
      deleted_images   = [],
      deleted_variants = [],
      by,
      description,
      sku,
      variants,
    } = data;
    const clean_name = sanitize(name);

    if (!clean_name.trim()) throw new Error('Product name cannot be empty');

    const _queryProductConstruct = db.product.findOne({
      selector: {
        id: {
          $eq: id,
        },
      },
    });

    const _queryProduct = await _queryProductConstruct.exec();

    if (!_queryProduct) throw new Error('Product not found');

    /**
     * ---------------------------------------
     * 1. Update flow if product has variants.
     * ---------------------------------------
     */
    if (variants && variants.length) {
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

      if (_queryBundles.length) throw new Error(`Cannot add new variant into this product since this product already included in some bundle, please remove it from the bundle first.`);

      /**
       * -------------------------------
       * 1.2. Update the product detail.
       * -------------------------------
       */
      const is_stocked = variants.filter(variant => variant.stock !== 0).length;

      await _queryProductConstruct.update({
        $set: {
          active: is_stocked ? true : false,
          name  : clean_name,
          ...(description ? { description: sanitize(description) } : {}),
          ...(by ? { by: sanitize(by) } : {}),
        },
      });

      await _queryProductConstruct.update({
        $unset: {
          sku  : true,
          price: true,
          stock: true,
        },
      });

      await _queryProductConstruct.update({
        $set: {
          updated_at: new Date().toISOString(),
        },
      });

      /**
       * ---------------------------
       * 1.3. Update product images.
       * ---------------------------
       */
      if (deleted_images.length) await removeImages(deleted_images, _queryProduct);

      if (new_images.length) {
        if (!isImagesValid(new_images)) throw new Error('Invalid file type');

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
          name          : v_name           = '',
          price         : v_price          = '0',
          stock         : v_stock          = 0,
          new_images    : v_new_images     = [],
          deleted_images: v_deleted_images = [],
          id            : v_id,
          sku           : v_sku,
        } = variant;
        const clean_v_name = sanitize(v_name);

        if (!clean_v_name.trim()) throw new Error('Variant name cannot be empty');
        if (!isNumeric(v_price))  throw new Error(`${v_name} price cannot be empty and must be a number`);
        if (!isNumeric(v_stock))  throw new Error(`${v_name} stock cannot be empty and must be a number`);

        const clean_v_price = sanitizeNumeric(v_price);
        const v_is_active   = v_stock >= 1 ? true : false;

        /**
         * -------------------------------------
         * 1.5.1. Check for existing variant ID.
         * -------------------------------------
         * If current variant iteration has existing ID (or variant currently exist), update the detail.
         */
        if (v_id) {
          const _queryConstructVariant = db.variant.findOne({
            selector: {
              id: {
                $eq: v_id,
              },
            }
          });

          const _queryVariant = await _queryConstructVariant.exec();

          if (!_queryVariant) throw new Error(`Cannot find product variant with id ${id}`);

          /**
           * ---------------------------------------------------
           * 1.5.1.1. Update current iteration variation detail.
           * ---------------------------------------------------
           */
          await _queryConstructVariant.update({
            $set: {
              active: v_is_active,
              name  : clean_v_name,
              price : clean_v_price,
              stock : v_stock,
              ...(v_sku ? { sku: sanitize(v_sku as string) } : {}),
            },
          });

          if (!v_sku) {
            await _queryConstructVariant.update({
              $unset: {
                sku: true,
              },
            });
          }

          await _queryConstructVariant.update({
            $set: {
              updated_at: new Date().toISOString(),
            },
          });

          const _queryUpdatedVariant = _queryVariant.getLatest();

          /**
           * ---------------------------------------------------
           * 1.5.1.2. Update current iteration variation images.
           * ---------------------------------------------------
           */
          if (v_deleted_images.length) await removeImages(v_deleted_images, _queryVariant);

          if (v_new_images.length) {
            if (!isImagesValid(v_new_images)) throw new Error('Invalid file type');

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
          if (_queryVariant.price !== _queryUpdatedVariant.price) {
            await updateBundlePrice({
              id: v_id,
              old_price: _queryVariant.price,
              new_price: _queryUpdatedVariant.price,
            });
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
            _queryVariant.stock === 0 && _queryUpdatedVariant.stock > 0 ||
            _queryVariant.stock > 0 && _queryUpdatedVariant.stock === 0
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
            price     : clean_v_price,
            stock     : v_stock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...(sku ? { sku: sanitize(v_sku as string) } : {}),
          });

          /**
           * ---------------------------------------------
           * 1.5.2.2. Add images to newly created variant.
           * ---------------------------------------------
           */
          if (v_new_images.length) {
            if (!isImagesValid(v_new_images)) throw new Error('Invalid file types');

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
     * This also run when product has actual variants, and those variants are removed in the editing process.
     */
    else {
      /**
       * -------------------------------
       * 2.1. Update the product detail.
       * -------------------------------
       */
      if (!price || !isNumeric(price)) throw new Error('Product without variants price cannot be empty and must be a number');
      if (!stock || !isNumeric(stock)) throw new Error('Product without variants stock cannot be empty and must be a number');

      const clean_price = sanitizeNumeric(price);
      const is_active = stock >= 1 ? true : false;

      await _queryProductConstruct.update({
        $set: {
          active: is_active,
          name  : clean_name,
          price : clean_price,
          stock,
          ...(description ? { description: sanitize(description) } : {}),
          ...(by ? { by: sanitize(by) } : {}),
          ...(sku ? { sku: sanitize(sku) } : {}),
        },
      });

      if (
        (!variants || !variants.length) ||
        !description ||
        !by ||
        !sku
      ) {
        await _queryProductConstruct.update({
          $unset: {
            ...((!variants || !variants.length) && { variants: true }),
            ...((!description) && { description: true }),
            ...((!by) && { by: true }),
            ...((!sku) && { sku: true }),
          },
        });
      }

      await _queryProductConstruct.update({
        $set: {
          updated_at : new Date().toISOString(),
        },
      });

      const _queryUpdatedProduct = _queryProduct.getLatest();

      /**
       * -------------------------------
       * 2.2. Update the product images.
       * -------------------------------
       */
      if (deleted_images.length) await removeImages(deleted_images, _queryProduct);

      if (new_images.length) {
        if (!isImagesValid(new_images)) throw new Error('Invalid file types');

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
       * --------------------------------------------------------------------------------------
       * 2.4. Update any bundle price price that contains current products one of it's product.
       * --------------------------------------------------------------------------------------
       */
      if (_queryProduct.price !== _queryUpdatedProduct.price) {
        await updateBundlePrice({
          id,
          old_price: _queryProduct.price!,
          new_price: _queryUpdatedProduct.price!,
        });
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
        _queryProduct.stock === 0 && _queryUpdatedProduct.stock! > 0 ||
        _queryProduct.stock! > 0 && _queryUpdatedProduct.stock === 0
      ) {
        await updateBundlesStatus({ id, active: is_active });
      }
    }
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
