import { db } from '@/database';

export default async (id: string): Promise<any> => {
  try {
    const _queryProduct = await db.product.findOne(id).exec();

    if (!_queryProduct) throw `Cannot find product with id ${id}.`;

    await _queryProduct.remove();
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
