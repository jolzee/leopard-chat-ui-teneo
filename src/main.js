import "babel-polyfill";
import "custom-event-polyfill";
import "element-matches";
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
import Vue from "vue";
import "./utils/vee-validate";

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

(function() {
  // make vuetify dialogs movable
  const d = {};
  document.addEventListener("mousedown", e => {
    const closestDialog = e.target.closest(".v-dialog.v-dialog--active");

    if (e.button === 0 && closestDialog != null && e.target.classList.contains("v-system-bar")) {
      // element which can be used to move element
      d.el = closestDialog; // element which should be moved
      d.mouseStartX = e.clientX;
      d.mouseStartY = e.clientY;
      d.elStartX = d.el.getBoundingClientRect().left;
      d.elStartY = d.el.getBoundingClientRect().top;
      d.el.style.position = "fixed";
      d.el.style.margin = 0;
      d.oldTransition = d.el.style.transition;
      d.el.style.transition = "none";
    }
  });
  document.addEventListener("mousemove", e => {
    if (d.el === undefined) return;
    d.el.style.left =
      Math.min(
        Math.max(d.elStartX + e.clientX - d.mouseStartX, 0),
        window.innerWidth - d.el.getBoundingClientRect().width
      ) + "px";
    d.el.style.top =
      Math.min(
        Math.max(d.elStartY + e.clientY - d.mouseStartY, 0),
        window.innerHeight - d.el.getBoundingClientRect().height
      ) + "px";
  });
  document.addEventListener("mouseup", () => {
    if (d.el === undefined) return;
    d.el.style.transition = d.oldTransition;
    d.el = undefined;
  });
  setInterval(() => {
    // prevent out of bounds
    const dialog = document.querySelector(".v-dialog.v-dialog--active");
    if (dialog === null) return;
    dialog.style.left =
      Math.min(parseInt(dialog.style.left), window.innerWidth - dialog.getBoundingClientRect().width) + "px";
    dialog.style.top =
      Math.min(parseInt(dialog.style.top), window.innerHeight - dialog.getBoundingClientRect().height) + "px";
  }, 100);
})();
