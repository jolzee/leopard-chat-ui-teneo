import Vue from "vue";
import App from "./App";
import router from "./router";
import { store, USE_LOCAL_STORAGE } from "./store.js";
import Modal from "./components/Modal.vue";
import Listening from "./components/Listening.vue";
// import VueYouTubeEmbed from "vue-youtube-embed";
import VueSession from "vue-session";
import "vue-loaders/dist/vue-loaders.css";
import longpress from "vue-long-press-directive";

import {
  BallScaleRippleMultipleLoader,
  LineScalePulseOutRapidLoader,
  BallPulseSyncLoader
} from "vue-loaders";
import vueSmoothScroll from "vue-smoothscroll";
import "babel-polyfill";
import parseBool from "parseboolean";
import "vue2-animate/dist/vue2-animate.min.css";
import moment from "moment";

import {
  Vuetify,
  VApp,
  VNavigationDrawer,
  VFooter,
  VList,
  VBtn,
  VIcon,
  VGrid,
  VToolbar,
  transitions,
  VTextField,
  VExpansionPanel,
  VCard,
  VDivider,
  VTooltip,
  VProgressLinear,
  VSwitch,
  VDialog,
  VSnackbar,
  VBtnToggle,
  VAlert,
  VAvatar,
  VDatePicker,
  VSelect,
  VSubheader,
  VForm,
  VChip,
  VRadioGroup,
  VBadge,
  VTextarea,
  VProgressCircular
} from "vuetify";
import "../node_modules/vuetify/src/stylus/app.styl";

if (parseBool(localStorage.getItem("darkTheme")) === null) {
  localStorage.setItem("darkTheme", "false");
}

store.state.dark = parseBool(localStorage.getItem("darkTheme")) !== false;

Vue.prototype.moment = moment;

Vue.use(longpress, { duration: 2000 });
Vue.use(Vuetify, {
  theme: store.state.theme,
  components: {
    VApp,
    VNavigationDrawer,
    VFooter,
    VList,
    VBtn,
    VIcon,
    VGrid,
    VToolbar,
    transitions,
    VTextField,
    VExpansionPanel,
    VCard,
    VDivider,
    VTooltip,
    VProgressLinear,
    VSwitch,
    VDialog,
    VSnackbar,
    VBtnToggle,
    VAlert,
    VAvatar,
    VDatePicker,
    VSelect,
    VSubheader,
    VForm,
    VChip,
    VRadioGroup,
    VBadge,
    VTextarea,
    VProgressCircular
  }
});

// Vue.use(VueYouTubeEmbed);
// Vue.use(AnimatedVue)
Vue.component("teneo-modal", Modal);
Vue.component("teneo-listening", Listening);
Vue.use(VueSession);
Vue.use(require("vue-shortkey"));
Vue.use(vueSmoothScroll);
Vue.component(LineScalePulseOutRapidLoader.name, LineScalePulseOutRapidLoader);
Vue.component(BallPulseSyncLoader.name, BallPulseSyncLoader);
Vue.component(
  BallScaleRippleMultipleLoader.name,
  BallScaleRippleMultipleLoader
);

Vue.config.productionTip = false;

/* eslint-disable no-new */

new Vue({
  el: "#app",
  store,
  router,
  mounted() {},
  created: function() {
    // if (!USE_LOCAL_STORAGE) {
    //   localStorage.clear();
    // }
  },
  updated() {},
  methods: {},
  render: h => h(App)
});
