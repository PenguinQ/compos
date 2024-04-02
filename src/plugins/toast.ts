import type { App } from 'vue';
import { useToast } from '@components/Toast/hooks';

export default {
  install(app: App) {
    const { items, add, remove } = useToast();

    app.provide('ToastProvider', { items, add, remove });
    app.config.globalProperties.$toastItems = items;
    app.config.globalProperties.$toastAdd = add;
  },
};
