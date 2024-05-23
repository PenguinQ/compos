export default async ({ id, data }: any) => {
  try {
    return;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }

    throw error;
  }
};
