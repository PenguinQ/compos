import type { RxDocument } from 'rxdb';

type Image = {
  id: string;
  data: Blob;
};

export default async (
  images: Image[],
  doc: RxDocument<unknown>,
) => {
  for (const image of images) {
    const { id, data } = image;
    const { type }     = data;

    await doc.putAttachment({ id, data, type });
  }
};
