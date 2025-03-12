export default (value: string): boolean => {
  if (typeof value !== 'string') return false;

  return /^-?\d+(\.\d+)?$/.test(value);
};
