import "core-js/stable";
import "regenerator-runtime/runtime";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
import utils from "./utils/utils";
const logger = require("./utils/logging")("main.js");
import Vue from "vue";
import "./utils/vee-validate";
import "./utils/drag";
// import "@mdi/font/css/materialdesignicons.css";
import "vue-loaders/dist/vue-loaders.css";
import "plyr/dist/plyr.css";
import "vue2-animate/dist/vue2-animate.min.css";
import App from "./App";
import router from "./router";

if (!utils.doesParameterExist("embed") && !utils.doesParameterExist("button")) {
  console.groupCollapsed(
    `%c Powered by %c Leopard Chat UI 💬 %c`,
    "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
    "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
    "background:transparent"
  );
  console.log("Author: Peter Joles - peter.joles@artificial-solutions.com");
  // console.log("Documentation: https://jolzee.gitbook.io/leopard/");
  // console.log("Code: https://github.com/jolzee/chat-teneo-vue");
  console.groupEnd();
}

import(/* webpackChunkName: "leopardConfig" */ "./utils/leopardConfig").then(
  config => {
    window.leopardConfig = config.default;
    logger.debug(`Setup > Leopard Config: `, window.leopardConfig);

    import("./store")
      .then(store => {
        store.default((vuetify, store) => {
          new Vue({
            router,
            store,
            vuetify,
            render: h => h(App)
          }).$mount("#app");
        });
      })
      .catch(error => {
        logger.error("Leopard Setup Error", error);
      });
  }
);
