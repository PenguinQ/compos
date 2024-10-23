import { db } from '@/database';

export default async (id: string) => {
  try {
    const _queryOrder = await db.order.findOne(id).exec();

    if (!_queryOrder) throw `[Order] No order found with id: ${id}.`;

    await _queryOrder.remove();
  } catch (error) {
    if (error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
