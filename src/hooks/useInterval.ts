import { onMounted, onUnmounted } from "vue";

export default (callback: () => void, duration = 1000) => {
  let timer: ReturnType<typeof setInterval> | null = null;

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    stop();
    timer = setInterval(callback, duration);
  };

  onMounted(start);
  onUnmounted(stop);

  return { start, stop };
};
