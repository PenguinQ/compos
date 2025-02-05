import { blobToBase64String } from 'rxdb';
import type { RxAttachment, RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import { getPageStatus, isVariant } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { BundleDoc, QueryPage } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export type BundlesData = BundleDoc & {
  images: string[];
};

type BundleListQuery = {
  active?: boolean;
  limit: number;
  observe?: boolean;
  page: number;
  search_query?: string;
  sort: 'asc' | 'desc';
  normalizer?: (data: unknown) => void;
};

export type BundleListQueryReturn = {
  data: BundlesData[];
  data_count: number;
  page: QueryPage;
};

export default async ({
  active,
  search_query,
  page,
  sort,
  limit,
  observe = false,
  normalizer,
}: BundleListQuery) => {
  try {
    const query_selector = search_query ? {
      name: { $regex: `.*${search_query}.*`, $options: 'i' },
      ...(active !== undefined && { active: { $eq: active } }),
    } : {
      id: { $gte: '' },
      ...(active !== undefined && { active: { $eq: active } }),
    };
    const query_skip  = page > 1 ? (page - 1) * limit : 0;
    const query_limit = limit;
    const query_sort  = [{ id: sort }];

    const getBundlesCount = async () => {
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

    const getBundlesData = async (data: RxDocument<BundleDoc>[]) => {
      const bundles_data = [];

      for (const bundle of data as RxDocument<BundleDoc>[]) {
        const bundle_json  = bundle.toJSON();
        const { products } = bundle_json;
        const bundle_images: string[] = [];

        for (const product of products) {
          const { id } = product;
          const _findProductQuery  = await db[isVariant(id) ? 'variant' : 'product'].findOne(id).exec();

          if (_findProductQuery) {
            const images    = _findProductQuery.allAttachments();
            const thumbnail = (images as RxAttachment<unknown>[]).filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

            if (thumbnail.length) {
              const thumbnail_data   = await thumbnail[0].getData();
              const thumbnail_base64 = await blobToBase64String(thumbnail_data);
              const { type }         = thumbnail_data;

              bundle_images.push(`data:${type};base64,${thumbnail_base64}`);
            }
          }
        }

        bundles_data.push({ images: bundle_images, ...bundle_json });
      }

      return bundles_data;
    };

    const _queryConstruct = db.bundle.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });
    const _queryBundle = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    /**
     * ----------------------
     * 1. Observable queries.
     * ----------------------
     */
    if (observe) {
      const observeableProcessor = async (data: unknown): Promise<object> =>{
        const bundles_count = await getBundlesCount();
        const total_page    = Math.ceil(bundles_count / query_limit);
        const { first_page, last_page } = await getPageStatus({
          db,
          collection: 'bundle',
          data      : data as RxDocument<BundleDoc>[],
          sortBy    : [{ id: sort }],
          query     : {
            name: { $regex: `.*${search_query}.*`, $options: 'i' },
            ...(active !== undefined && { active: { $eq: active } }),
          },
          sort,
        });
        const bundles_data = await getBundlesData(data as RxDocument<BundleDoc>[]);

        return {
          data      : bundles_data,
          data_count: bundles_count,
          page      : {
            current: page,
            first  : first_page,
            last   : last_page,
            total  : total_page,
          },
        };
      };

      return {
        observeable: true,
        result     : _queryBundle,
        observeableProcessor,
        normalizer,
      };
    }

    /**
     * --------------------------
     * 2. Non-observable queries.
     * --------------------------
     */
    const bundles_count = await getBundlesCount();
    const total_page    = Math.ceil(bundles_count / query_limit);
    const { first_page, last_page } = await getPageStatus({
      db,
      collection: 'bundle',
      data      : _queryBundle as RxDocument<BundleDoc>[],
      sortBy    : [{ id: sort }],
      query     : {
        name: { $regex: `.*${search_query}.*`, $options: 'i' },
        ...(active !== undefined && { active: { $eq: active } }),
      },
      sort,
    });
    const bundles_data = await getBundlesData(_queryBundle as RxDocument<BundleDoc>[]);

    const raw_data = {
      data      : bundles_data,
      data_count: bundles_count,
      page      : {
        current: page,
        first  : first_page,
        last   : last_page,
        total  : total_page,
      },
    };

    return {
      result: normalizer ? normalizer(raw_data) : raw_data,
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
