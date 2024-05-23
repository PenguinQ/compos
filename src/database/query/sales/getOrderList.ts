import { db } from '@/database';
import type { QueryParams } from '@/database/types';

interface GetOrderListParams extends Omit<QueryParams, ''> {
  id: string;
}

export default async ({
  id,
  observe,
  normalizer,
}: GetOrderListParams) => {
  try {


  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
