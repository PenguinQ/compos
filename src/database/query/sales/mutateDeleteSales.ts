import { db } from '@/database';

export default async (id: string) => {
  try {
    const _querySales = await db.sales.findOne(id).exec();

    if (!_querySales) throw `No sales found with id: ${id}.`;

    const { name } = _querySales.toJSON();

    await _querySales.remove();

    return name;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
