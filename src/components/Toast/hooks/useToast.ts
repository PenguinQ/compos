import { ref } from 'vue';
import type { Ref } from 'vue';
import type { ToastItem as ToastItemProps } from '../ToastItem.vue';

type ToastItem = Omit<ToastItemProps, 'modelValue'> & {
  id: number;
};

export type ToastReturn = {
  items: Ref<ToastItem[]>;
  add: (props: ToastItem) => void;
  remove: () => void;
};

let toastId = 0;

export default (): ToastReturn => {
  const items   = ref<ToastItem[]>([]);
  const counter = ref(0);

  const add = (props: ToastItem) => {
    items.value.push({ ...props, id: ++toastId });
  };

  const remove = () => {
    counter.value += 1;

    if (items.value.length === counter.value) {
      items.value   = [];
      counter.value = 0;
    }
  };

  return { items, add, remove };
};
