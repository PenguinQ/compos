import { db } from '@/database';

export default async (id: string) => {
  try {
    const _querySale = await db.sale.findOne(id).exec();

    if (!_querySale) throw `No sale found with id: ${id}.`;

    const { name } = _querySale.toJSON();

    await _querySale.remove();

    return name;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
