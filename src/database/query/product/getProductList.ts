import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { getPageStatus } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, QueryParams, QueryReturn } from '@/database/types';

export type ProductsData = ProductDoc & {
  image?: string;
};

export default async ({
  active,
  page,
  search_query,
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
    const query_skip  = page > 1 ? (page - 1) * limit : 0;
    const query_limit = limit;
    const query_sort  = [{ id: sort }];

    const getProductCount = async () => {
      let _query;

      if (search_query) {
        _query = await db.product.find({ selector: query_selector }).exec();

        return _query.length;
      }

      _query = await db.product.find({
        selector: {
          ...(active !== undefined && { active: { $eq: active } }),
        },
      }).exec();

      return _query.length;
    };

    const _queryConstruct = db.product.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });
    const _queryProduct = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    /**
     * ----------------------
     * 1. Observable queries.
     * ----------------------
     */
    if (observe) {
      const observeableProcessor = async (data: RxDocument<unknown>[]): Promise<object> => {
        const product_count = await getProductCount();
        const total_page    = Math.ceil(product_count / query_limit);
        const { first_page, last_page } = await getPageStatus({
          collection: 'product',
          data,
          sort,
          sortBy: [{ id: sort }],
          query: {
            name: { $regex: `.*${search_query}.*`, $options: 'i' },
            ...(active !== undefined && { active: { $eq: active } }),
          },
        });
        let product_data = [];

        for (const product of data as RxDocument<ProductDoc>[]) {
          const product_json = product.toJSON();
          const images       = product.allAttachments();
          const thumbnail    = images.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
          let product_image  = '';

          if (thumbnail.length) {
            const attachment       = await thumbnail[0].getData();
            const attachmentString = await blobToBase64String(attachment);
            const { type }         = attachment;

            product_image = `data:${type};base64,${attachmentString}`;
          }

          product_data.push({ image: product_image, ...product_json });
        }

        return {
          data      : product_data,
          data_count: product_count,
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
        result : _queryProduct,
        observeableProcessor,
        normalizer,
      };
    }

    /**
     * --------------------------
     * 2. Non-observable queries.
     * --------------------------
     */
    const product_count = await getProductCount();
    const total_page    = Math.ceil(product_count / query_limit);
    const { first_page, last_page } = await getPageStatus({
      collection: 'product',
      data: _queryProduct as RxDocument<ProductDoc>[],
      sort,
      sortBy: [{ id: sort }],
      query: {
        name: { $regex: `.*${search_query}.*`, $options: 'i' },
        ...(active !== undefined && { active: { $eq: active } }),
      },
    });
    let product_data = [];

    for (const product of _queryProduct as RxDocument<ProductDoc>[]) {
      const product_json = product.toJSON();
      const images       = product.allAttachments();
      const thumbnail    = images.filter(att => att.id.startsWith(THUMBNAIL_ID_PREFIX));
      let product_image  = '';

      if (thumbnail.length) {
        const attachment       = await thumbnail[0].getData();
        const attachmentString = await blobToBase64String(attachment);
        const { type }         = attachment;

        product_image = `data:${type};base64,${attachmentString}`;
      }

      product_data.push({ image: product_image, ...product_json });
    }

    const raw_data = {
      data      : product_data,
      data_count: product_count,
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
