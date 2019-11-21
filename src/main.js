// import "babel-polyfill";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
import Vue from "vue";
import "./utils/vee-validate";
import "./utils/drag";

// import "@mdi/font/css/materialdesignicons.css";
import "vue-loaders/dist/vue-loaders.css";
import "plyr/dist/plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";

import { getStore } from "./store";
import App from "./App";
import router from "./router";

// start sentry

if (process.env.NODE_ENV === "production" && process.env.VUE_APP_SENTRY_DSN) {
  Promise.all([import("@sentry/browser"), import("@sentry/integrations")]).then(
    ([Sentry, Integrations]) => {
      Sentry.init({
        dsn: process.env.VUE_APP_SENTRY_DSN,
        integrations: [new Integrations.Vue({ Vue, attachProps: true })],
        logErrors: true
      });
    }
  );
}
// end sentry

// Vue.prototype.$log = console.log.bind(console);

getStore((vuetify, store) => {
  new Vue({
    vuetify,
    router,
    store,
    render: h => h(App)
  }).$mount("#app");
});
