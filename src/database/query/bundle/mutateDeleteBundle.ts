import { db } from '@/database';

export default async (id: string): Promise<any> => {
  try {
    const _queryBundle = await db.bundle.findOne(id).exec();

    if (!_queryBundle) throw `Cannot find bundle with id ${id}.`;

    await _queryBundle.remove();
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
