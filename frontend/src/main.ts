import router from './router';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { apolloClient } from './apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';
import persistedState from 'pinia-plugin-persistedstate';
//@ts-ignore
import InstantSearch from 'vue-instantsearch/vue3/es';

import App from './App.vue';
import '@/assets/index.less';

const app = createApp(App);

const pinia = createPinia();
pinia.use(persistedState);

app.use(pinia);
app.use(router);
app.use(InstantSearch);

app.provide(DefaultApolloClient, apolloClient);

app.mount('#app');
