import { createApp } from 'vue';

import { Toast, ToastContainer } from '@components/Toast';

export default {
  install(app: any) {
    const instance = createApp(ToastContainer);
    let ToastVM = instance.mount(document.createElement('div'));

    document.body.appendChild(ToastVM.$el);
  }
};
