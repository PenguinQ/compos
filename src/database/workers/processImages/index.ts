import type { RxAttachment } from 'rxdb';

const imageWorker = new Worker(new URL('./imageWorker.ts', import.meta.url), { type: 'module' });

export const processImage = (image: RxAttachment<unknown>) => new Promise((resolve, reject) => {
  const handleMessage = ({ data }: any) => {
    if (data.success) {
      imageWorker.removeEventListener('message', handleMessage);
      resolve(data.result);
    } else {
      reject(new Error(data.error));
    }
  };

  imageWorker.addEventListener('message', handleMessage);

  image.getData().then((imageData) => {
    imageWorker.postMessage({
      id  : image.id,
      type: image.type,
      imageData,
    });
  }).catch(error => {
    imageWorker.removeEventListener('message', handleMessage);
    reject(error);
  });
});


export default (images: any) => {
  return new Promise((resolve, reject) => {
    const results   = <any[]>[];
    let   completed = 0;

    const handleMessage = ({ data }: any) => {
      if (data.success) {
        results.push(data.result);
        completed++;

        if (completed === images.length) {
          imageWorker.removeEventListener('message', handleMessage);
          resolve(results);
        }
      } else {
        reject(new Error(data.error));
      }
    };

    imageWorker.addEventListener('message', handleMessage);

    images.forEach(async (image: any) => {
      try {
        const imageData = await image.getData();

        imageWorker.postMessage({
          id  : image.id,
          type: image.type,
          imageData,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};
