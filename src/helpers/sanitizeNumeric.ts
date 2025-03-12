export default (dirty: number): number | null => {
  return (typeof dirty !== 'number' || isNaN(dirty) || !isFinite(dirty)) ? null : dirty;
};
