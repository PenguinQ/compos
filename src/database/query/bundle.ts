import { db } from '@database';

export const getBundleDetail = async ({ id, normalizer }: any) => {
  try {
    const bundle = await db.bundle.findOne({ selector: { id } }).exec();
    const { product: products, ...bundleData } = bundle.toJSON();
    const product_list: any = [];

    for (const product of products) {
      const { id, variant_id } = product;

      if (variant_id) {
        const queryVariant               = await db.variant.findOne({ selector: { id: variant_id } }).exec();
        const queryVariantAttachment     = await queryVariant.allAttachments();
        const queryProduct               = await queryVariant.populate('product_id');
        const { id: p_id, name: p_name } = queryProduct.toJSON();
        const { ...variantData }         = queryVariant.toJSON();
        const variant_attachments        = [];

        for (const attachment of queryVariantAttachment) {
          const { id } = attachment;
          const data   = await attachment.getData();

          variant_attachments.push({ id, data });
        }

        product_list.push({
          product_id  : p_id,
          product_name: p_name,
          attachment: variant_attachments,
          ...variantData,
        });
      } else {
        const queryProduct           = await db.product.findOne({ selector: { id } }).exec();
        const queryProductAttachment = await queryProduct.allAttachments();
        const { ...productData }     = queryProduct.toJSON();
        const product_attachments    = [];

        for (const attachment of queryProductAttachment) {
          const { id } = attachment;
          const data   = await attachment.getData();

          product_attachments.push({ id, data });
        }

        product_list.push({ attachment: product_attachments, ...productData });
      }
    }

    return {
      result: normalizer({ product: product_list, ...bundleData }),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateAddBundle = (data: any) => {
  try {
    console.log(data);
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};

export const mutateEditBundle = ({ id, data }: any) => {
  try {
    console.log(id, data);
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
