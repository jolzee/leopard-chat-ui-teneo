import Vue from "vue";
import "./plugins/vuetify";
import App from "./App";
import router from "./router";
import { storeInit } from "./store";
import { STORAGE_KEY } from "./constants/constants";
import Modal from "./components/Modal.vue";
import Listening from "./components/Listening.vue";
import VueSession from "vue-session";
import "vue-loaders/dist/vue-loaders.css";
import longpress from "vue-long-press-directive";
import Dayjs from "vue-dayjs";
import VuePlyr from "vue-plyr";
import 'vue-plyr/dist/vue-plyr.css'
import {
  LineScaleLoader,
  BallScaleRippleMultipleLoader,
  LineScalePulseOutRapidLoader,
  BallPulseSyncLoader
} from "vue-loaders";
import vueSmoothScroll from "vue-smoothscroll";
import "babel-polyfill";
import parseBool from "parseboolean";
import "vue2-animate/dist/vue2-animate.min.css";
import Prism from "prismjs";

if (parseBool(localStorage.getItem(STORAGE_KEY + "darkTheme")) === null) {
  localStorage.setItem(STORAGE_KEY + "darkTheme", "false");
}

/* eslint-disable no-new */

storeInit(function(store) {
  store.state.dark = parseBool(localStorage.getItem(STORAGE_KEY + "darkTheme")) !== false;

  Vue.use(Dayjs, {
    lang: "en"
  });

  // Vue.use(require("vue-pusher"), {
  //   api_key: "45c36b5d20295269c6e5",
  //   options: {
  //     cluster: "us2",
  //     encrypted: true,
  //     forceTLS: true
  //   }
  // });

  Vue.use(VuePlyr);
  Vue.use(Prism);
  Vue.use(longpress, { duration: 2000 });

  Vue.component("teneo-modal", Modal);
  Vue.component("teneo-listening", Listening);
  Vue.use(VueSession);
  Vue.use(require("vue-shortkey"));
  Vue.use(vueSmoothScroll);

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
