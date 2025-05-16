export default (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
