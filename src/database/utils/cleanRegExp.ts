export default (dirty: string) => {
  return dirty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
