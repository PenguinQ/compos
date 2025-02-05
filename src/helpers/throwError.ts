import { ComPOSError } from './createError'

export default (error: unknown): never => {
  if (error instanceof ComPOSError || error instanceof Error) throw error;

  throw new Error(String(error));
};
