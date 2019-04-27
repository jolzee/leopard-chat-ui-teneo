import Vue from "vue";

import "@fortawesome/fontawesome-free/css/all.css";
import "@mdi/font/css/materialdesignicons.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vue-loaders/dist/vue-loaders.css";
import "vue-plyr/dist/vue-plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";

import { getStore } from "./store";
import App from "./App";
import router from "./router";

console.groupCollapsed("Leopard Information");
console.log("%cLeopard Chat UI 💬", "background: #3776D0; color: white; font-size: x-large;");
console.log("Author: Peter Joles - peter.joles@artificial-solutions.com");
console.log("Documentation: https://jolzee.gitbook.io/leopard/");
console.log("Code: https://github.com/jolzee/chat-teneo-vue");
console.groupEnd();

getStore(store => {
  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
});
