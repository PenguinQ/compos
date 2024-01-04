import { db } from '@database';
import { VARIANT_PREFIX } from '@database/constant';

export const getBundleDetail = async ({ id, normalizer }: any) => {
  try {
    const bundle = await db.bundle.findOne({ selector: { id } }).exec();
    const { product } = bundle;

    const productList = await Promise.all(product.map(async (prod: any) => {
      const { id, variant_id } = prod;

      if (variant_id) {
        const variant_detail = await db.variant.findOne({ selector: { id: variant_id } }).exec();
        const product_detail = await variant_detail.populate('product_id');

        const {
          id: v_id,
          active,
          name,
          image,
          price,
          stock,
          sku,
          created_at,
          updated_at,
        } = variant_detail;
        const { id: p_id, name: p_name } = product_detail;

        return {
          id: v_id,
          active,
          name,
          product_id: p_id,
          product_name: p_name,
          image,
          price,
          stock,
          sku,
          created_at,
          updated_at,
        };
      } else {
        const detail = await db.product.findOne({ selector: { id } }).exec();

        return {
          id: detail.id,
          active: detail.active,
          name: detail.name,
          image: detail.image,
          price: detail.price,
          stock: detail.stock,
          created_at: detail.created_at,
          updated_at: detail.updated_at,
        };
      }
    })).catch((error: unknown) => {
      throw new Error(error as string);
    });

    return {
      result: normalizer({
        id: bundle.id,
        name: bundle.name,
        active: bundle.active,
        description: bundle.description,
        fixed_price: bundle.fixed_price,
        price: bundle.price,
        created_at: bundle.created_at,
        updated_at: bundle.updated_at,
        product: productList || [],
      }),
    };
  } catch (error: unknown) {
    throw new Error(error as string);
  }
};
