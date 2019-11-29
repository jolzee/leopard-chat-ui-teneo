import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

function loadView(view) {
  return () => import(/* webpackChunkName: "view-[request]" */ `@/views/${view}.vue`);
}

function loadChatView() {
  return () => import(/* webpackPrefetch: true */ `@/views/Chat.vue`);
}

export default new Router({
  routes: [
    {
      path: "/",
      name: "chat",
      component: loadChatView()
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
