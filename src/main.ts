import './assets/main.css'

import { createApp } from "vue";
import * as VueRouter from "vue-router";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import externalLink from './directives/external-link'

const routes = [{ path: "/", component: App }];
const router = VueRouter.createRouter({
  // Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes,
});
const app = createApp(App);

app.use(router);
app.use(ElementPlus);
app.directive('external', externalLink)
app.mount("#app");
