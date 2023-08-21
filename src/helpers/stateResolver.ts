export default (state: string | boolean, isBoolean: boolean = true) => {
  if (isBoolean) {
    return state ? true : undefined;
  }

  return state ? state : undefined;
};
