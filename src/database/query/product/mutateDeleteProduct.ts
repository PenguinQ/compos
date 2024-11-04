import { db } from '@/database';

export default async (id: string) => {
  try {
    const _queryProduct = await db.product.findOne(id).exec();

    if (!_queryProduct) throw `No product found with id: ${id}.`;

    const { name } = _queryProduct.toJSON();

    await _queryProduct.remove();

    return name;
  } catch (error) {
    if (error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
