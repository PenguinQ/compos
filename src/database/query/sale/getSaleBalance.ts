import type { RxDocument } from 'rxdb';

// Databases
import { db } from '@/database';
import type { QueryParams, SaleDoc } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

type GetSaleBalanceReturnData = {
  initial_balance?: string;
  final_balance?: string;
};

export type GetSaleBalanceReturn = {
  data: GetSaleBalanceReturnData;
};

type GetSaleBalance = Omit<QueryParams, 'active' | 'limit' | 'page' | 'search_query' | 'sort'> &{
  id: string;
};

export default async ({ id, observe, normalizer }: GetSaleBalance) => {
  try {
    const _queryConstruct = db.sale.findOne(id);
    const _querySale      = observe ? _queryConstruct.$ : await _queryConstruct.exec();

    if (observe) {
      const observeableProcessor = async (data: unknown): Promise<object> => {
        const { initial_balance, final_balance } = data as RxDocument<SaleDoc>;

        return {
          data: {
            initial_balance,
            final_balance,
          },
        };
      };

      return {
        observeable: true,
        result     : _querySale,
        observeableProcessor,
        normalizer,
      };
    }

    if (!_querySale) throw new Error('Sale not found');

    const { initial_balance, final_balance } = _querySale as RxDocument<SaleDoc>;

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
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
