import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@database';

import { compressProductImage, handlePagination } from '../utils';

import { GetBundleList } from '../types/bundle';

export const getBundleList = async ({ search_query, page, sort, limit, normalizer }: GetBundleList) => {
  try {
    const query_selector = search_query ? { name: { $regex: `.*${search_query}.*`, $options: 'i' } } : { id: { $gte: '' } };
    const query_skip     = page > 1 ? (page - 1) * limit : 0;
    const query_limit    = limit;
    const query_sort     = [{ id: sort }];
    let queryCount: number;

    /**
     * ---------------------------
     * 1. Count number of bundles.
     * ---------------------------
     * If search query is provided, count manually from the results of find() because RxDB doesn't
     * allow non-fully-indexed count queries.
     *
     * Ref: https://rxdb.info/rx-query.html#allowslowcount
     */
    if (search_query) {
      const _searchQuery = await db.bundle.find({ selector: query_selector }).exec();

      queryCount = _searchQuery.length;
    } else {
      queryCount = await db.bundle.count().exec();
    }

    const _bundleQuery = await db.bundle.find({
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
      let first_selector     = first_id ? sort === 'desc' ? { id: { $gt: first_id } } : { id: { $lt: first_id } } : undefined;
      let last_selector      = last_id ? sort === 'desc' ? { id: { $lt: last_id } } : { id: { $gt: last_id } } : undefined;

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
        collection: 'bundle',
        selector: { first: first_selector, last: last_selector },
        sort: [{ id: sort }],
      });

      for (const bundle of data) {
        const { ...bundleData }     = bundle.toJSON();
        const { product: products } = bundleData;
        let bundle_images       = [];

        for (const product of products) {
          const { id, variant_id } = product;
          const _findProductQuery  = await db[variant_id ? 'variant' : 'product'].findOne(variant_id ? variant_id : id).exec();

          if (_findProductQuery) {
            const images    = _findProductQuery.allAttachments();
            const thumbnail = images.filter((att: any) => att.id.startsWith('THUMB_'));

            if (thumbnail.length) {
              const thumbnail_data   = await thumbnail[0].getData();
              const thumbnail_base64 = await blobToBase64String(thumbnail_data);
              const { type }         = thumbnail_data;

              bundle_images.push(`data:${type};base64,${thumbnail_base64}`);
            }
          }
        }

        result.push({ image: bundle_images, ...bundleData });
      }

      return {
        first_page,
        last_page,
        total_page,
        count: queryCount,
        bundles: result,
      };
    };

    return {
      result: _bundleQuery,
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

export const getBundleDetail = async ({ id, normalizer }: any) => {
  try {
    const bundle = await db.bundle.findOne({ selector: { id } }).exec();
    const { product: products, ...bundleData } = bundle.toJSON();
    const product_list: any = [];

    /**
     * ---------------------------
     * 1. Set bundle product data.
     * ---------------------------
     */
    for (const product of products) {
      const { id, variant_id } = product;

      /**
       * ---------------------------------
       * 1.1 Flow if product is a variant.
       * ---------------------------------
       */
      if (variant_id) {
        const queryVariant               = await db.variant.findOne({ selector: { id: variant_id } }).exec();
        const queryProduct               = await queryVariant.populate('product_id');
        const attachments                = queryVariant.allAttachments();
        const images                     = attachments.filter((att: any) => att.id.startsWith('IMG_'));
        const { id: p_id, name: p_name } = queryProduct.toJSON();
        const { ...variantData }         = queryVariant.toJSON();
        const variant_images             = [];

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          variant_images.push({ id, data: `data:${type};base64,${image_base64}` });
        }

        product_list.push({
          product_id  : p_id,
          product_name: p_name,
          image: variant_images,
          ...variantData,
        });
      }
      /**
       * -------------------------------------
       * 1.2 Flow if product is not a variant.
       * -------------------------------------
       */
      else {
        const queryProduct        = await db.product.findOne({ selector: { id } }).exec();
        const { ...productData }  = queryProduct.toJSON();
        const attachments         = queryProduct.allAttachments();
        const images              = attachments.filter((att: any) => att.id.startsWith('IMG_'));
        const product_images      = [];

        for (const image of images) {
          const { id, type } = image;
          const image_data   = await image.getData();
          const image_base64 = await blobToBase64String(image_data);

          product_images.push({ id, data: `data:${type};base64,${image_base64}` });
        }

        product_list.push({ image: product_images, ...productData });
      }
    }

    return {
      result: normalizer({ product: product_list, ...bundleData }),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateAddBundle = (data: any) => {
  try {
    console.log(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateEditBundle = ({ id, data }: any) => {
  try {
    console.log(id, data);
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
