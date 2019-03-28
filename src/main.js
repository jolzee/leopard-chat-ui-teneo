import "@fortawesome/fontawesome-free/css/all.css";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "vue-loaders/dist/vue-loaders.css";
import "vue-plyr/dist/vue-plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";
import App from "./App";
import Dayjs from "vue-dayjs";
import Listening from "./components/Listening.vue"; // component dialog that shows then capturing audio
import Modal from "./components/Modal.vue";
import Prism from "prismjs";
import Vue from "vue";
import VuePlyr from "vue-plyr";
import VueSession from "vue-session";
import longpress from "vue-long-press-directive";
import parseBool from "parseboolean";
import router from "./router";
import vueSmoothScroll from "vue-smoothscroll";
// import "./plugins/vuetify";
import {
  BallPulseSyncLoader,
  BallScaleRippleMultipleLoader,
  LineScaleLoader,
  LineScalePulseOutRapidLoader
} from "vue-loaders";
import { STORAGE_KEY } from "./constants/solution-config-default";
import { storeInit } from "./store";

if (parseBool(localStorage.getItem(STORAGE_KEY + "darkTheme")) === null) {
  localStorage.setItem(STORAGE_KEY + "darkTheme", "false");
}

/* eslint-disable no-new */

storeInit(function(store) {
  store.state.ui.dark = parseBool(localStorage.getItem(STORAGE_KEY + "darkTheme")) !== false;

  Vue.use(Dayjs, {
    lang: "en"
  });

  Vue.use(VuePlyr);
  Vue.use(Prism);
  Vue.use(longpress, { duration: process.env.VUE_APP_LONG_PRESS_LENGTH });

  Vue.use(VueSession);
  Vue.use(require("vue-shortkey"));
  Vue.use(vueSmoothScroll);

  Vue.component("teneo-modal", Modal);
  Vue.component("teneo-listening", Listening);
  Vue.component(LineScaleLoader.name, LineScaleLoader);
  Vue.component(LineScalePulseOutRapidLoader.name, LineScalePulseOutRapidLoader);
  Vue.component(BallPulseSyncLoader.name, BallPulseSyncLoader);
  Vue.component(BallScaleRippleMultipleLoader.name, BallScaleRippleMultipleLoader);

  Vue.config.productionTip = false;

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
});
