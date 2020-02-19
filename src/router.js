import Vue from "vue";
import Router from "vue-router";
import Chat from "@/views/Chat.vue";
const logger = require("@/utils/logging").getLogger("router.js");

Vue.use(Router);

function loadView(view) {
  return () => import(/* webpackChunkName: "view-[request]" */ `@/views/${view}.vue`);
}

logger.debug(`Setting up Vue Router`);
export default new Router({
  routes: [
    {
      path: "/",
      name: "chat",
      component: Chat
    },
    {
      path: "/about",
      name: "about",
      component: loadView("About")
    },
    {
      path: "/login",
      name: "login",
      component: loadView("Login")
    },
    {
      path: "/register",
      name: "register",
      component: loadView("Register")
    },
    {
      path: "/config",
      name: "config",
      component: loadView("Config"),
      beforeEnter: (to, from, next) => {
        if (window.leopardConfig.hideConfigMenu) {
          next(false);
        } else {
          next();
        }
      }
    },
    {
      path: "/help",
      name: "help",
      component: loadView("Help")
    },
    {
      path: "/history",
      name: "history",
      component: loadView("Chat")
    }
  ]
});
