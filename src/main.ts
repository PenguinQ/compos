import { createApp } from 'vue';
import { initDB } from '@database';

import './assets/main.scss';
import './assets/global.scss';

import App from './App.vue';
import router from './router';
import { registerPWA } from './utils/pwa';
import toast from '@/plugins/toast';

const app = createApp(App);

app.use(router);
app.use(toast);

initDB();
registerPWA();

app.mount('#app');
