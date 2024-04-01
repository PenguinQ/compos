import { ref } from 'vue';
import type { ToastItemProps } from '../ToastItem.vue';

const useToast = () => {
  const items = ref<ToastItemProps[]>([]);
  const counter = ref(0);

  const add = (props: ToastItemProps) => {
    items.value.push(props);
  };

  const remove = () => {
    counter.value += 1;

    if (items.value.length === counter.value) {
      items.value = [];
      counter.value = 0;
    }
  };

  return { items, add, remove };
};

export { useToast };
