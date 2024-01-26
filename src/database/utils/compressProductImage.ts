import { monotonicFactory } from 'ulidx';

import compressImage from './compressImage';

type Macrograph = {
  id: string;
  data: File;
}

type Thumbnail = {
  id: string;
  data: File;
}

type CompressImages = {
  thumbnail: Thumbnail[];
  macrograph: Macrograph[];
}

export default async (images: File[]): Promise<CompressImages>  => {
  const ulid     = monotonicFactory();
  let thumbnail  = [];
  let macrograph = [];

  if (images.length) {
    for (const image of images) {
      const image_ulid = ulid();
      const compressed_thumbnail = await compressImage({ image, quality: 0.8, dimension: 360 });
      const compressed_image = await compressImage({ image, quality: 0.8, dimension: 800 });

      thumbnail.push({ id: `THUMB_${image_ulid}`, data: compressed_thumbnail });
      macrograph.push({ id: `IMG_${image_ulid}`, data: compressed_image })
    }
  }

  return { thumbnail, macrograph };
};
