import { RxAttachment, blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { getPaginationSelector, handlePagination } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';

type GetBundleListParams = {
  active?: boolean;
  limit: number;
  observe?: boolean;
  page: number;
  search_query: string;
  sort: 'asc' | 'desc';
  normalizer: (data: any) => void;
};

type GetBundleList = {
  result?: object| void;
  observe?: boolean;
  preprocessor?: (data: any) => void;
  normalizer?: (data: object) => void;
};

export default async ({
  active,
  search_query,
  page,
  sort,
  limit,
  observe = false,
  normalizer,
}: GetBundleListParams): Promise<GetBundleList> => {
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
    let bundle_count: number;

    if (search_query) {
      const _searchQuery = await db.bundle.find({ selector: query_selector }).exec();

      bundle_count = _searchQuery.length;
    } else {
      const _searchQuery = await db.bundle.find({
        selector: {
          ...(active !== undefined && { active: { $eq: active } }),
        },
      }).exec();

      bundle_count = _searchQuery.length;
    }

    const _queryConstruct = db.bundle.find({
      selector: query_selector,
      skip: query_skip,
      limit: query_limit,
      sort: query_sort,
    });
    const _queryBundle        = observe ? _queryConstruct.$ : await _queryConstruct.exec();
    const total_page          = Math.ceil(bundle_count / query_limit);
    let bundle_data: object[] = [];

    /**
     * ----------------------
     * 1. Observable queries.
     * ----------------------
     */
    if (observe) {
      const preprocessor = async (data: RxDocument<any>[]) =>{
        const { first_selector, last_selector } = getPaginationSelector({
          data,
          sort,
          query: {
            name: { $regex: `.*${search_query}.*`, $options: 'i' },
            ...(active !== undefined && { active: { $eq: active } }),
          },
        });
        const { first_page, last_page } = await handlePagination({
          collection: 'bundle',
          selector: { first: first_selector, last: last_selector },
          sort: [{ id: sort }],
        });

        for (const bundle of data) {
          const bundle_json           = bundle.toJSON();
          const { product: products } = bundle_json;
          let bundle_images           = [];

          for (const product of products) {
            const { id, variant_id } = product;
            const _findProductQuery  = await db[variant_id ? 'variant' : 'product'].findOne(variant_id ? variant_id : id).exec();

            if (_findProductQuery) {
              const images    = _findProductQuery.allAttachments();
              const thumbnail = (images as RxAttachment<any>[]).filter((att: any) => att.id.startsWith(THUMBNAIL_ID_PREFIX));

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
          bundles   : bundle_data,
          count     : bundle_count,
          first_page,
          last_page,
          total_page,
        };
      };

      return {
        result      : _queryBundle,
        observe     : true,
        preprocessor,
        normalizer,
      };
    }

    /**
     * --------------------------
     * 2. Non-observable queries.
     * --------------------------
     */
    const { first_selector, last_selector } = getPaginationSelector({
      data: _queryBundle as RxDocument<any>[],
      sort,
      query: {
        name: { $regex: `.*${search_query}.*`, $options: 'i' },
        ...(active !== undefined && { active: { $eq: active } }),
      },
    });
    const { first_page, last_page } = await handlePagination({
      collection: 'bundle',
      selector: { first: first_selector, last: last_selector },
      sort: [{ id: sort }],
    });

    for (const bundle of _queryBundle as RxDocument<any>[]) {
      const bundle_json           = bundle.toJSON();
      const { product: products } = bundle_json;
      let bundle_images           = [];

      for (const product of products) {
        const { id, variant_id } = product;
        const _findProductQuery  = await db[variant_id ? 'variant' : 'product'].findOne(variant_id ? variant_id : id).exec();

        if (_findProductQuery) {
          const images    = _findProductQuery.allAttachments();
          const thumbnail = (images as RxAttachment<any>[]).filter((att: any) => att.id.startsWith(THUMBNAIL_ID_PREFIX));

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
      bundles   : bundle_data,
      count     : bundle_count,
      first_page,
      last_page,
      total_page,
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
