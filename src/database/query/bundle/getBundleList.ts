import { blobToBase64String } from 'rxdb';
import DOMPurify from 'isomorphic-dompurify';
import type { RxAttachment, RxDocument } from 'rxdb';
import type { Observable } from 'rxjs';

import { db } from '@/database';
import { cleanRegexp, getPageStatus, isVariant } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { BundleDoc, ProductDoc, QueryParams, VariantDoc } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

interface GetBundleListParams extends Omit<QueryParams, 'limit' | 'page'> {
  page: number;
  limit: number;
  sort: 'asc' | 'desc';
}

export type Bundle = BundleDoc & {
  images: string[];
};

export type QueryReturn = {
  data: Bundle[];
  data_count: number;
  observable?: boolean;
  page: {
    current: number;
    first: boolean;
    last: boolean;
    total: number;
  };
};

export type ObservableQueryReturn = {
  observable: true;
  observableQuery: Observable<RxDocument<BundleDoc>[]>;
  observableQueryFn: (data: RxDocument<BundleDoc>[]) => Promise<Omit<QueryReturn, 'observable'>>;
};

export default (async ({
  active,
  search_query,
  limit,
  observe = false,
  page,
  sort,
}: GetBundleListParams) => {
  try {
    const { sanitize } = DOMPurify;
    const clean_query = cleanRegexp(sanitize(search_query ? search_query : ''));
    const query_selector = clean_query ? {
      name: { $regex: `.*${clean_query}.*`, $options: 'i' },
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

      if (clean_query) {
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
            const thumbnail = (images as RxAttachment<ProductDoc | VariantDoc>[]).filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));

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

    const queryFn = async (query: RxDocument<BundleDoc>[] | Observable<RxDocument<BundleDoc>[]>) =>{
      const bundles_count = await getBundlesCount();
      const total_page    = Math.ceil(bundles_count / query_limit);
      const { first_page, last_page } = await getPageStatus({
        collection: 'bundle',
        query     : {
          name: { $regex: `.*${clean_query}.*`, $options: 'i' },
          ...(active !== undefined && { active: { $eq: active } }),
        },
        data      : query as RxDocument<BundleDoc>[],
        sortBy    : [{ id: sort }],
        sort,
        db,
      });
      const bundles_data = await getBundlesData(query as RxDocument<BundleDoc>[]);

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

    const _queryConstruct = db.bundle.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });

    const _queryBundle = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    return observe ? {
      observable       : observe,
      observableQuery  : _queryBundle,
      observableQueryFn: queryFn,
    } : {
      observable: observe,
      ...await queryFn(_queryBundle),
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
}) as {
  (params: GetBundleListParams & { observe: true }): Promise<ObservableQueryReturn>;
  (params: GetBundleListParams & { observe?: false }): Promise<QueryReturn>;
};
