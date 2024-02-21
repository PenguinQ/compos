import { db } from '@/database';

export default async (): Promise<any> => {
  try {

  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
