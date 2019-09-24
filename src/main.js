import "babel-polyfill";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
import Vue from "vue";

import "@mdi/font/css/materialdesignicons.css";
// import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vue-loaders/dist/vue-loaders.css";
import "vue-plyr/dist/vue-plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";

import { getStore } from "./store";
import App from "./App";
import router from "./router";

console.groupCollapsed(
  `%c Powered by %c Leopard Chat UI 💬 %c`,
  "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
  "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
  "background:transparent"
);
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
