export default (callback: (...args: any) => void, delay = 300) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: any) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};
