// Router
import router from '@/router';

// Helpers
import { ComPOSError } from '@/helpers/createError';

export default async (operation: Function, params: object) => {
  try {
    const response = await operation({ ...params });

    return response;
  } catch (error) {
    if (error instanceof ComPOSError) {
      if (error.status === 404) router.push('/not-found');

      throw error;
    }

    if (error instanceof Error) throw error;

    throw new Error(String(error));
  }
};
