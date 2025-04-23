import { createApp } from 'vue';
import { initDB } from '@/database';

import './assets/core.main.scss';
import './assets/core.global.scss';

import App from './App.vue';
import router from './router';
import { registerPWA } from './utils/pwa';
import toast from '@/plugins/toast';

initDB().then(() => {
  const app = createApp(App);

  app.use(router);
  app.use(toast);
  registerPWA();

  app.mount('#app');
}).catch(error => {
  console.error('Database initialization failed:', error);
});

