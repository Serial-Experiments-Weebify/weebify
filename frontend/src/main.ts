import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { DefaultApolloClient } from '@vue/apollo-composable';

import App from './App.vue';
import '@/assets/index.less';

import router from './router';
import { apolloClient } from './apollo';
import persistedState from 'pinia-plugin-persistedstate';

const app = createApp(App);
const pinia = createPinia();

pinia.use(persistedState);

app.use(pinia);
app.provide(DefaultApolloClient, apolloClient);
app.use(router);

app.mount('#app');
