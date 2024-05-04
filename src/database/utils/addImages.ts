import type { RxDocument } from 'rxdb';
import { ProductDoc, VariantDoc } from '../types';

type Image = {
  id: string;
  data: Blob;
};

export default async (
  images: Image[],
  doc: RxDocument<ProductDoc> | RxDocument<VariantDoc>
) => {
  for (const image of images) {
    const { id, data } = image;
    const { type }     = data;

    await doc.putAttachment({ id, data, type });
  }
};
