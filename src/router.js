import About from "@/views/About";
import Login from "@/views/Login";
import Register from "@/views/Register";
import Chat from "@/views/Chat";
import Config from "@/views/Config";
import Help from "@/views/Help";
import Vue from "vue";
import Router from "vue-router";

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
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/register",
      name: "register",
      component: Register
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
