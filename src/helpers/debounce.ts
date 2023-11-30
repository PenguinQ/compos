const debounce = (callback: any, delay = 300) => {
  let timeout: ReturnType <typeof setTimeout>;

  return (...args: any) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export default debounce;
