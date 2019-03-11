import Vue from "vue";
import Router from "vue-router";
import Chat from "@/views/Chat";
import About from "@/views/About";
import Help from "@/views/Help";
import Config from "@/views/Config";

Vue.use(Router);

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
      component: About
    },
    {
      path: "/config",
      name: "config",
      component: Config
    },
    {
      path: "/help",
      name: "help",
      component: Help
    },
    {
      path: "/history",
      name: "history",
      component: Chat
    }
  ]
});
