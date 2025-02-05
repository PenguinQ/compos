type CreateErrorOptions = {
  code?: string;
  status?: number;
};

export class ComPOSError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  };
};

export default (message: string, options?: CreateErrorOptions) => {
  return new ComPOSError(message, options?.code, options?.status);
};
