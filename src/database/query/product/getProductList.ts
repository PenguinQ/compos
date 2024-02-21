import { blobToBase64String } from 'rxdb';
import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import { getPaginationSelector, handlePagination } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';

type GetProductListParams = {
  active?: boolean;
  limit: number;
  observe?: boolean;
  page: number;
  search_query: string;
  sort: 'asc' | 'desc';
  normalizer: (data: any) => void;
};

type GetProductList = {
  result?: object | void;
  observe?: boolean;
  preprocessor?: (data: any) => void;
  normalizer?: (data: object) => void;
};

export default async ({
  active,
  page,
  search_query,
  sort,
  limit,
  observe = false,
  normalizer,
}: GetProductListParams): Promise<GetProductList | any> => {
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
    let product_count: number;

    if (search_query) {
      const _searchQuery = await db.product.find({ selector: query_selector }).exec();

      product_count = _searchQuery.length;
    } else {
      const _searchQuery = await db.product.find({
        selector: {
          ...(active !== undefined && { active: { $eq: active } }),
        },
      }).exec();

      product_count = _searchQuery.length;
    }

    const _queryConstruct = db.product.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });
    const _queryProduct = observe ? _queryConstruct.$ : await _queryConstruct.exec();
    const total_page    = Math.ceil(product_count / query_limit);
    const product_data: object[] = [];

    /**
     * ---------------------
     * 1. Observable queries
     * ---------------------
     */
    if (observe) {
      const preprocessor = async (data: RxDocument<any>[]) => {
        const { first_selector, last_selector } = getPaginationSelector({
          data,
          sort,
          query: {
            name: { $regex: `.*${search_query}.*`, $options: 'i' },
            ...(active !== undefined && { active: { $eq: active } }),
          },
        });
        const { first_page, last_page } = await handlePagination({
          collection: 'product',
          selector: { first: first_selector, last: last_selector },
          sort: [{ id: sort }],
        });

        for (const product of data) {
          const product_json = product.toJSON();
          const images       = product.allAttachments();
          const thumbnail    = images.filter((att: any) => att.id.startsWith(THUMBNAIL_ID_PREFIX));
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
          products  : product_data,
          count     : product_count,
          first_page,
          last_page,
          total_page,
        };
      };

      return {
        result      : _queryProduct,
        observe     : true,
        preprocessor,
        normalizer,
      };
    }

    /**
     * -------------------------
     * 2. Non-observable queries
     * -------------------------
     */
    const { first_selector, last_selector } = getPaginationSelector({
      data: _queryProduct as RxDocument<any>[],
      sort,
      query: {
        name: { $regex: `.*${search_query}.*`, $options: 'i' },
        ...(active !== undefined && { active: { $eq: active } }),
      },
    });
    const { first_page, last_page } = await handlePagination({
      collection: 'product',
      selector: { first: first_selector, last: last_selector },
      sort: [{ id: sort }],
    });

    for (const product of _queryProduct as RxDocument<any>[]) {
      const product_json = product.toJSON();
      const images       = product.allAttachments();
      const thumbnail    = images.filter((att: any) => att.id.startsWith(THUMBNAIL_ID_PREFIX));
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
      products  : product_data,
      count     : product_count,
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
