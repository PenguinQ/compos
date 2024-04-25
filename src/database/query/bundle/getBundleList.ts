import { RxAttachment, blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { getPageStatus } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { BundleDoc, QueryParams, QueryReturn } from '@/database/types';

export type BundlesData = BundleDoc & {
  image?: string[];
};

export default async ({
  active,
  search_query,
  page,
  sort,
  limit,
  observe = false,
  normalizer,
}: QueryParams): Promise<QueryReturn> => {
  try {
    const query_selector = search_query ? {
      name: { $regex: `.*${search_query}.*`, $options: 'i' },
      ...(active !== undefined && { active: { $eq: active } }),
    } : {
      id: { $gte: '' },
      ...(active !== undefined && { active: { $eq: active } }),
    };
    const query_skip     = page > 1 ? (page - 1) * limit : 0;
    const query_limit    = limit;
    const query_sort     = [{ id: sort }];

    const getBundleCount = async () => {
      let _query;

      if (search_query) {
        _query = await db.bundle.find({ selector: query_selector }).exec();

        return _query.length;
      }

      _query = await db.bundle.find({
        selector: {
          ...(active !== undefined && { active: { $eq: active } }),
        },
      }).exec();

      return _query.length;
    };

    const _queryConstruct = db.bundle.find({
      selector: query_selector,
      skip: query_skip,
      limit: query_limit,
      sort: query_sort,
    });
    const _queryBundle        = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    /**
     * ----------------------
     * 1. Observable queries.
     * ----------------------
     */
    if (observe) {
      const observeableProcessor = async (data: RxDocument<unknown>[]): Promise<object> =>{
        const bundle_count = await getBundleCount();
        const total_page    = Math.ceil(bundle_count / query_limit);
        const { first_page, last_page } = await getPageStatus({
          collection: 'bundle',
          data,
          sort,
          sortBy: [{ id: sort }],
          query: {
            name: { $regex: `.*${search_query}.*`, $options: 'i' },
            ...(active !== undefined && { active: { $eq: active } }),
          },
        });
        let bundle_data = [];

        for (const bundle of data as RxDocument<BundleDoc>[]) {
          const bundle_json           = bundle.toJSON();
          const { product: products } = bundle_json;
          let bundle_images           = [];

          for (const product of products) {
            const { id, variant_id } = product;
            const _findProductQuery  = await db[variant_id ? 'variant' : 'product'].findOne(variant_id ? variant_id : id).exec();

            if (_findProductQuery) {
              const images    = _findProductQuery.allAttachments();
              const thumbnail = (images as RxAttachment<unknown>[]).filter((att: any) => att.id.startsWith(THUMBNAIL_ID_PREFIX));

              if (thumbnail.length) {
                const thumbnail_data   = await thumbnail[0].getData();
                const thumbnail_base64 = await blobToBase64String(thumbnail_data);
                const { type }         = thumbnail_data;

                bundle_images.push(`data:${type};base64,${thumbnail_base64}`);
              }
            }
          }

          bundle_data.push({ image: bundle_images, ...bundle_json });
        }

        return {
          data      : bundle_data,
          data_count: bundle_count,
          page      : {
            current: page,
            first: first_page,
            last: last_page,
            total: total_page,
          },
        };
      };

      return {
        observeable: true,
        result : _queryBundle,
        observeableProcessor,
        normalizer,
      };
    }

    /**
     * --------------------------
     * 2. Non-observable queries.
     * --------------------------
     */
    const bundle_count = await getBundleCount();
    const total_page    = Math.ceil(bundle_count / query_limit);
    const { first_page, last_page } = await getPageStatus({
      collection: 'bundle',
      data: _queryBundle as RxDocument<any>[],
      sort,
      sortBy: [{ id: sort }],
      query: {
        name: { $regex: `.*${search_query}.*`, $options: 'i' },
        ...(active !== undefined && { active: { $eq: active } }),
      },
    });
    let bundle_data = [];

    for (const bundle of _queryBundle as RxDocument<BundleDoc>[]) {
      const bundle_json           = bundle.toJSON();
      const { product: products } = bundle_json;
      let bundle_images           = [];

      for (const product of products) {
        const { id, variant_id } = product;
        const _findProductQuery  = await db[variant_id ? 'variant' : 'product'].findOne(variant_id ? variant_id : id).exec();

        if (_findProductQuery) {
          const images    = _findProductQuery.allAttachments();
          const thumbnail = (images as RxAttachment<any>[]).filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

          if (thumbnail.length) {
            const attachment       = await thumbnail[0].getData();
            const attachmentString = await blobToBase64String(attachment);
            const { type }         = attachment;

            bundle_images.push(`data:${type};base64,${attachmentString}`);
          }
        }
      }

      bundle_data.push({ image: bundle_images, ...bundle_json });
    }

    const raw_data = {
      data      : bundle_data,
      data_count: bundle_count,
      page      : {
        current: page,
        first: first_page,
        last: last_page,
        total: total_page,
      },
    };

    return {
      result: normalizer ? normalizer(raw_data) : raw_data,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
