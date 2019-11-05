import "babel-polyfill";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
import Vue from "vue";
import "./utils/vee-validate";
import "./utils/drag";

// import "@mdi/font/css/materialdesignicons.css";
import "vue-loaders/dist/vue-loaders.css";
import "vue-plyr/dist/vue-plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";

import { getStore } from "./store";
import App from "./App";
import router from "./router";

getStore((vuetify, store) => {
  new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
});
