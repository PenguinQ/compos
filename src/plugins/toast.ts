import { inject } from 'vue';
import type { App } from 'vue';
import useToast from '@hooks/useToast';

export default {
  install(app: App) {
    // const { items, add } = useToast();

    // app.provide('ToastProvider', { items, add });
    // app.config.globalProperties.$toastItems = items as any;
    // app.config.globalProperties.$toastAdd = add as any;
  },
};
