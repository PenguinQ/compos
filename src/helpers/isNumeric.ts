export default (value: number): boolean => {
  if (typeof value !== 'number') return false;

  return !isNaN(value) && isFinite(value);
};
