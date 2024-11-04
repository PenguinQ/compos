import { db } from '@/database';

export default async (id: string) => {
  try {
    const _queryBundle = await db.bundle.findOne(id).exec();

    if (!_queryBundle) throw `No bundle found with id: ${id}.`;

    const { name } = _queryBundle.toJSON();

    await _queryBundle.remove();

    return name;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
