import { blobToBase64String } from 'rxdb';

type ImageWorker = {
  data: {
    imageData: Blob;
    id?: string;
    type?: string;
  };
};

self.onmessage = async ({ data }: ImageWorker) => {
  const { imageData, id, type } = data;

  try {
    const base64_image = await blobToBase64String(imageData);

    self.postMessage({
      success: true,
      result: {
        url: `'data:${type};base64,${base64_image}'`,
        id,
      },
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : String(Error),
    });
  }
};
