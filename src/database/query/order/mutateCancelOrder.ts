// Databases
import { db } from '@/database';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export default async (id: string) => {
  try {
    const _queryOrder = await db.order.findOne(id).exec();

    if (!_queryOrder) throw new Error('Order not found');

    const { name } = _queryOrder;

    await _queryOrder.update({
      $set: {
        canceled  : true,
        updated_at: new Date().toISOString(),
      },
    });

    return name;
  } catch (error) {
    if (error instanceof ComPOSError || error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
