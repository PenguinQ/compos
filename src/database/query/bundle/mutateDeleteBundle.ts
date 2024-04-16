import { db } from '@/database';

export default async (id: string): Promise<any> => {
  try {
    const _queryBundle = await db.bundle.findOne(id).exec();

    if (!_queryBundle) throw `Bundle didn't exist.`;

    await _queryBundle.remove();
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
