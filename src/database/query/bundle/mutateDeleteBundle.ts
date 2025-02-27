// Databases
import { db } from '@/database';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export default async (id: string) => {
  try {
    const _queryBundle = await db.bundle.findOne(id).exec();

    if (!_queryBundle) throw new Error('Bundle not found');

    const { name } = _queryBundle.toJSON();

    await _queryBundle.remove();

    return name;
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
