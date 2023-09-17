import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const currentBuild = 1;

if (
	localStorage.getItem('build') &&
	localStorage.getItem('build') !== currentBuild.toString()
)
	localStorage.clear();

localStorage.setItem('build', '1');

app.use(createPinia());

app.mount('#app');
