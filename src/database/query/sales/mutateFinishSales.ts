import { db } from '@/database';

export default async (id: string): Promise<string> => {
  try {
    const _querySales = await db.sales.findOne(id).exec();

    if (!_querySales) throw `Cannot find sales with id ${id}.`;

    const { name } = _querySales;

    await _querySales.update({
      $set: {
        finished  : true,
        updated_at: new Date().toISOString(),
      },
    });

    return name;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(String(error));
  }
};
