export default (value: unknown) => {
  return /^\d+$/.test(value as string);
};
