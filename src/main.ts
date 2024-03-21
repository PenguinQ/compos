import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { initDB } from '@database';

import App from './App.vue';
import router from './router';

import './assets/main.scss';

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(pinia);

initDB();

app.mount('#app');
