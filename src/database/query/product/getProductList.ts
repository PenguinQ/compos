import { blobToBase64String } from 'rxdb';
import type { DeepReadonlyArray, RxDocument } from 'rxdb';

import { db } from '@/database';
import { getPageStatus } from '@/database/utils';
import { THUMBNAIL_ID_PREFIX } from '@/database/constants';
import type { ProductDoc, VariantDoc } from '@/database/types';

export type VariantsData = VariantDoc & {
  images: string[];
};

export interface ProductsData extends Omit<ProductDoc, 'variant'> {
  images: string[];
  variant?: DeepReadonlyArray<string> | VariantsData[];
}

type ProductListQuery = {
  active?: boolean;
  complete?: boolean;
  limit: number;
  observe?: boolean;
  page: number;
  search_query?: string;
  sort: 'asc' | 'desc';
  normalizer?: (data: unknown) => void;
};

export default async ({
  active,
  complete,
  page,
  search_query,
  sort,
  limit,
  observe = false,
  normalizer,
}: ProductListQuery) => {
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

    const getProductData = async (data: RxDocument<ProductDoc>[]) => {
      const product_data: ProductsData[] = [];

      for (const product of data) {
        const { variant: product_variant, ...rest } = product.toJSON();
        const product_variant_detail: VariantsData[] = [];
        const product_images            = product.allAttachments();
        const product_thumbnails        = product_images.filter(img => img.id.startsWith(THUMBNAIL_ID_PREFIX));
        let   product_thumbnails_base64 = [];

        for (const thumbnail of product_thumbnails) {
          const thumbnail_data   = await thumbnail.getData();
          const thumbnail_base64 = await blobToBase64String(thumbnail_data);
          const { type }         = thumbnail_data;

          product_thumbnails_base64.push(`data:${type};base64,${thumbnail_base64}`);
        }

        if (complete && product_variant) {
          for (const variant of product_variant) {
            const _queryVariant = await db.variant.findOne({ selector: { id: variant } }).exec();

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
          images: product_thumbnails_base64,
          variant: complete ? product_variant_detail : product_variant,
          ...rest,
        });
      }

      return product_data;
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
        const product_data = await getProductData(data as RxDocument<ProductDoc>[]);

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
    const product_data = await getProductData(_queryProduct as RxDocument<ProductDoc>[]);

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
