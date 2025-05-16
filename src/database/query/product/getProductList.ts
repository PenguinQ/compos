import { blobToBase64String } from 'rxdb';
import DOMPurify from 'isomorphic-dompurify';
import type { RxDocument } from 'rxdb';
import type { Observable } from 'rxjs';

import { db } from '@/database';
import { cleanRegexp, getPageStatus } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc, QueryParams } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

interface GetProductListParams extends Omit<QueryParams, 'limit' | 'page'> {
  complete: boolean;
  page: number;
  limit: number;
  sort: 'asc' | 'desc';
}

export type Variant = VariantDoc & {
  images: string[];
};

export type Product = Omit<ProductDoc, 'variants'> & {
  images: string[];
  variants: Variant[] | string[];
};

export type QueryReturn = {
  data: Product[];
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
  observableQuery: Observable<RxDocument<ProductDoc>[]>;
  observableQueryFn: (data: RxDocument<ProductDoc>[]) => Promise<Omit<QueryReturn, 'observable'>>;
};

export default (async ({
  active,
  complete,
  limit,
  observe = false,
  page,
  search_query,
  sort,
}: GetProductListParams) => {
  try {
    const { sanitize } = DOMPurify;
    const clean_query = cleanRegexp(sanitize(search_query ? search_query : ''));
    const query_selector = clean_query ? {
      name: { $regex: `.*${clean_query}.*`, $options: 'i' },
      ...(active !== undefined && { active }),
    } : {
      id: { $gte: '' },
      ...(active !== undefined && { active }),
    };
    const query_skip  = page > 1 ? (page - 1) * limit : 0;
    const query_limit = limit;
    const query_sort  = [{ id: sort }];

    const getProductsCount = async () => {
      let _query;

      if (clean_query) {
        _query = await db.product.find({ selector: query_selector }).exec();

        return _query.length;
      }

      _query = await db.product.find({
        selector: {
          ...(active !== undefined && { active }),
        },
      }).exec();

      return _query.length;
    };

    const getProductsData = async (data: RxDocument<ProductDoc>[]) => {
      const product_data = [];

      for (const product of data) {
        const { variants: product_variants, ...rest } = product.toJSON();
        const product_variant_detail    = [];
        const product_images            = product.allAttachments();
        const product_thumbnails        = product_images.filter(img => img.id.startsWith(THUMBNAIL_ID_PREFIX));
        let   product_thumbnails_base64 = [];

        for (const thumbnail of product_thumbnails) {
          const thumbnail_data   = await thumbnail.getData();
          const thumbnail_base64 = await blobToBase64String(thumbnail_data);
          const { type }         = thumbnail_data;

          product_thumbnails_base64.push(`data:${type};base64,${thumbnail_base64}`);
        }

        if (complete) {
          for (const variant of product_variants || []) {
            const _queryVariant = await db.variant.findOne({
              selector: {
                id: variant,
                ...(active !== undefined && { active }),
              },
            }).exec();

            if (_queryVariant) {
              const variant_json              = _queryVariant.toJSON();
              const variant_images            = _queryVariant.allAttachments();
              const variant_thumbnails        = variant_images.filter(img => img.id.startsWith(THUMBNAIL_ID_PREFIX));
              let   variant_thumbnails_base64 = [];

              for (const thumbnail of variant_thumbnails) {
                const thumbnail_data   = await thumbnail.getData();
                const thumbnail_base64 = await blobToBase64String(thumbnail_data);
                const { type }         = thumbnail_data;

                variant_thumbnails_base64.push(`data:${type};base64,${thumbnail_base64}`);
              }

              product_variant_detail.push({ images: variant_thumbnails_base64, ...variant_json })
            }
          }
        }

        product_data.push({
          images  : product_thumbnails_base64,
          variants: complete ? product_variant_detail : product_variants || [],
          ...rest,
        });
      }

      return product_data;
    };

    const queryFn = async (query: RxDocument<ProductDoc>[] | Observable<RxDocument<ProductDoc>[]>) => {
      const products_count = await getProductsCount();
      const total_page     = Math.ceil(products_count / query_limit);
      const { first_page, last_page } = await getPageStatus({
        collection: 'product',
        query     : {
          name: { $regex: `.*${clean_query}.*`, $options: 'i' },
          ...(active !== undefined && { active: { $eq: active } }),
        },
        data      : query as RxDocument<ProductDoc>[],
        sortBy    : [{ id: sort }],
        sort,
        db,
      });
      const products_data = await getProductsData(query as RxDocument<ProductDoc>[]);

      return {
        data      : products_data,
        data_count: products_count,
        page      : {
          current: page,
          first  : first_page,
          last   : last_page,
          total  : total_page,
        },
      };
    };

    const _queryConstruct = db.product.find({
      selector: query_selector,
      skip    : query_skip,
      limit   : query_limit,
      sort    : query_sort,
    });

    const _queryProduct = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    return observe ? {
      observable       : observe,
      observableQuery  : _queryProduct,
      observableQueryFn: queryFn,
    } : {
      observable: observe,
      ...await queryFn(_queryProduct),
    };
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
}) as {
  (params: GetProductListParams & { observe: true }): Promise<ObservableQueryReturn>;
  (params: GetProductListParams & { observe?: false }): Promise<QueryReturn>;
};
