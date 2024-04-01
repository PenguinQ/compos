import { ref } from 'vue';
import type { ToastItemProps } from '@components/Toast/ToastItem.vue';

export default () => {
  const items = ref<ToastItemProps[]>([]);

  const add = (props: ToastItemProps) => {
    items.value.push(props);
  };

  return { items, add };
};
