// Databases
import { db } from '@/database';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export default async (id: string) => {
  try {
    const _queryProduct = await db.product.findOne(id).exec();

    if (!_queryProduct) throw new Error(`Product not found`);

    const { name } = _queryProduct.toJSON();

    await _queryProduct.remove();

    return name;
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
