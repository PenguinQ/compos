import { db } from '@/database';

export default async (id: string): Promise<any> => {
  try {
    const _queryProduct = await db.product.findOne(id).exec();

    if (!_queryProduct) throw `[Product] No product found with id: ${id}.`;

    await _queryProduct.remove();
  } catch (error) {
    if (error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
