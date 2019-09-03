import "babel-polyfill";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
import Vue from "vue";

import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vue-loaders/dist/vue-loaders.css";
import "vue-plyr/dist/vue-plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";

import { getStore } from "./store";
import App from "./App";
import router from "./router";

console.groupCollapsed("Powered by Leopard 💬");
console.log("Leopard Chat UI");
console.log("Author: Peter Joles - peter.joles@artificial-solutions.com");
console.log("Documentation: https://jolzee.gitbook.io/leopard/");
console.log("Code: https://github.com/jolzee/chat-teneo-vue");
console.groupEnd();

getStore((vuetify, store) => {
  new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
});
