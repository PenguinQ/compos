// Databases
import { db } from '@/database';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export default async (id: string) => {
  try {
    const _querySale = await db.sale.findOne(id).exec();

    if (!_querySale) throw new Error('Sale not found');

    const { name } = _querySale.toJSON();

    await _querySale.remove();

    return name;
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
