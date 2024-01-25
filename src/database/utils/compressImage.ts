import Compressor from 'compressorjs';
import isSafari from './isSafari';

type CompressImage = {
  image: File;
  quality: number;
  dimension: number;
}

/**
 * Currently in iOS all browsers are just reskinned Safari, it means Chrome, Firefox, and other
 * popular browsers ARE Safari, due to Apple regulation and restriction on iOS.
 *
 * Therefore in all browsers in iOS, all compression format cannot be a webp and will be on
 * set to AUTO depending on the source file.
 *
 * Compressor is using HTMLCanvasElement toBlob which currently doesn't support mime/type .webp
 * in Safari.
 */
export default ({ image, quality, dimension }: CompressImage): Promise<File> => {
  const mimeType = isSafari() ? 'auto' : 'image/webp';

  return new Promise((resolve, reject) => {
    new Compressor(image, {
      quality,
      maxWidth: dimension,
      maxHeight: dimension,
      mimeType,
      success: (result: any) => resolve(result),
      error: (error: any) => reject(error),
    });
  });
};
