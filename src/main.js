import "core-js/stable";
import "regenerator-runtime/runtime";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
const logger = require("@/utils/logging").getLogger("main.js");
import Vue from "vue";
import App from "@/App";
import router from "@/router";
import { leopardLogBanner } from "./utils/leopardLogBanner";
leopardLogBanner();

import(/* webpackChunkName: "leopardConfig" */ "@/utils/leopardConfig").then(config => {
  window.leopardConfig = config.default;
  logger.info(`🐆 Leopard Config: `, window.leopardConfig);

  import("@/store")
    .then(builder => {
      builder.default().then(({ vuetify, store }) => {
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
});
