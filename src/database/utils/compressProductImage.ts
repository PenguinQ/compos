import { monotonicFactory } from 'ulidx';

import compressImage from './compressImage';
import { THUMBNAIL_ID_PREFIX, IMAGE_ID_PREFIX } from '@/database/constants';

type Images = {
  id: string;
  data: File;
};

type CompressImages = {
  thumbnails: Images[];
  images: Images[];
};

export default async (data: File[]): Promise<CompressImages>  => {
  const ulid = monotonicFactory();
  let thumbnails = [];
  let images = []

  if (data.length) {
    for (const image of data) {
      const synchronized_ulid = ulid();
      const compressed_thumbnail = await compressImage({ image, quality: 0.8, dimension: 360 });
      const compressed_image = await compressImage({ image, quality: 0.8, dimension: 800 });

      thumbnails.push({ id: `${THUMBNAIL_ID_PREFIX + synchronized_ulid}`, data: compressed_thumbnail });
      images.push({ id: `${IMAGE_ID_PREFIX + synchronized_ulid}`, data: compressed_image })
    }
  }

  return { thumbnails, images };
};
