// Databases
import { db } from '@/database';
import type { DatabaseCollection } from '@/database/types';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export default async (collection: keyof DatabaseCollection, id: string) => {
  try {
    const doc = await db[collection].findOne({ selector: { id } }).exec();

    return doc ? true : false;
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
