export default (value: unknown): boolean => {
  if (typeof value === 'number') return Number.isInteger(value) && value >= 0;

  if (typeof value === 'string') return /^\d+$/.test(value as string);

  return false;
};
