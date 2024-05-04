export default (obj: object) => {
  return JSON.parse(JSON.stringify(obj));
};
