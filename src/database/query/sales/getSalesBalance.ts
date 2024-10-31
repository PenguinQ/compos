import type { RxDocument } from 'rxdb';

import { db } from '@/database';
import type { QueryParams, SalesDoc } from '@/database/types';

type GetSalesBalanceReturnData = {
  initial_balance?: string;
  final_balance?: string;
};

export type GetSalesBalanceReturn = {
  data: GetSalesBalanceReturnData;
};

type GetSalesBalance = Omit<QueryParams, 'active' | 'limit' | 'page' | 'search_query' | 'sort'> &{
  id: string;
};

export default async ({ id, observe, normalizer }: GetSalesBalance) => {
  try {
    const _queryConstruct = db.sales.findOne(id);
    const _querySales     = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    if (observe) {
      const observeableProcessor = async (data: unknown): Promise<object> => {
        const { initial_balance, final_balance } = data as RxDocument<SalesDoc>;

        return {
          data: {
            initial_balance,
            final_balance,
          },
        };
      };

      return {
        observeable: true,
        result     : _querySales,
        observeableProcessor,
        normalizer,
      };
    }

    if (!_querySales) throw `There's no sales with id ${id}.`;

    const { initial_balance, final_balance } = _querySales as RxDocument<SalesDoc>;

    const raw_data = {
      data: {
        initial_balance,
        final_balance,
      },
    };

    return {
      result: normalizer ? normalizer(raw_data) : raw_data,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
