import { db } from '@/database';

export default async (id: string) => {
  try {
    const _queryOrder = await db.order.findOne(id).exec();

    if (!_queryOrder) throw `No order found with id: ${id}.`;

    const { name } = _queryOrder;

    await _queryOrder.update({
      $set: {
        canceled  : true,
        updated_at: new Date().toISOString(),
      },
    });

    return name;
  } catch (error) {
    if (error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
