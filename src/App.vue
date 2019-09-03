<template>
  <div>
    <v-app
      :dark="$vuetify.theme.dark"
      v-if="showButtonOnly"
      class="application-button"
    >
      <div
        id="chat-open-close-button-embed"
        @click="toggleEmbedButton"
      >
        <v-fab-transition>
          <v-btn
            fab
            dark
            color="primary"
            elevation="2"
            class="embed-button-center"
            :class="{ pulse: (pulseButton && !isChatOpen)}"
            :style="customCssButtonToolbar"
          >
            <v-icon
              dark
              v-text="isChatOpen ? 'close' : 'chat'"
            ></v-icon>
          </v-btn>
        </v-fab-transition>
      </div>
    </v-app>
    <v-app
      v-else
      toolbar
      :class="{'elevation-2': !embed, 'application-float': float, 'application-embed': embed}"
    >
      <div
        id="chat-open-close-button"
        v-if="!embed"
      >
        <!-- <v-badge
        overlap
        color="#282A2E"
      >
        <template v-slot:badge>
          <v-icon
            dark
            small
            color="#1CB51C"
          >
            mdi-checkbox-multiple-blank-circle
          </v-icon>
        </template>
        <v-hover>
          <v-avatar
            slot-scope="{ hover }"
            size="66"
            :class="`elevation-${hover ? 6 : 2}`"
            @click="toggleChat"
            v-show="showChatButton"
          >
            <img
              :src="hover ? 'https://lh3.googleusercontent.com/-l34qOEimV5o/AAAAAAAAAAI/AAAAAAADJFg/Qu4IolfMLzc/photo.jpg?sz=150' : 'https://avatars0.githubusercontent.com/u/36912049?s=460&v=4'"
              alt="Peter"
            >
          </v-avatar>
        </v-hover>
      </v-badge> -->

        <v-fab-transition>
          <v-btn
            fab
            dark
            color="primary"
            @click="toggleChat"
            v-show="showChatButton"
            :class="{ pulse: (pulseButton && !showChatWindow)}"
            :style="customCssButtonToolbar"
          >
            <v-icon
              dark
              v-text="showChatWindow ? 'close' : 'chat'"
            ></v-icon>
          </v-btn>
        </v-fab-transition>
      </div>
      <div
        id="teneo"
        v-if="showChatWindow"
        :class="{'elevation-2': !embed, 'application-float': float, 'application-embed': embed}"
      >
        <transition
          name="menu-transition"
          enter-active-class="animated slideInRight"
          leave-active-class="animated slideOutRight"
        >
          <v-navigation-drawer
            app
            :clipped="clipped"
            v-if="drawer"
            v-model="drawer"
            enable-resize-watcher
            temporary
            right
            width="250"
          >
            <v-row
              align="center"
              justify="center"
            >
              <v-img
                :src="backgroundImage()"
                :lazy-src="backgroundImage()"
                aspect-ratio="1"
                height="170px"
              >
                <v-row class="lightbox white--text ma-4">
                  <v-col>
                    <div class="headline font-weight-medium">Artificial Solutions</div>
                    <div class="body-2">{{ $t('about.page.content') }}</div>
                  </v-col>
                </v-row>
              </v-img>
            </v-row>

            <v-list class="px-2">
              <v-list-item
                ripple
                value="true"
                v-for="(menuItem, i) in activeMenuItems"
                :key="i"
                :to="menuItem.route"
                @click="lookForLogout(menuItem)"
              >
                <v-list-item-action>
                  <v-icon
                    medium
                    :class="menuClass"
                  >{{menuItem.icon}}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title
                    class="subheading"
                    :class="menuClassText"
                  >{{ $t(menuItem.titleKey) }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
        </transition>

        <v-toolbar
          :color="toolbarColor"
          :flat="false"
          height="64"
          style="z-index: 3;"
          :class="{'teneo-toolbar-float' : float, 'teneo-toolbar-embed' : embed}"
          :style="toolbarStyle"
        >
          <v-app-bar-nav-icon
            @click.stop="drawer = !drawer"
            class="secondary--text"
          ></v-app-bar-nav-icon>
          <v-toolbar-title
            v-text="toolbarTitle"
            class="pl-0"
          ></v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            x-small
            fab
            ripple
            @click="toggleBrightness"
            elevation="2"
            color="secondary"
          >
            <v-icon
              dark
              v-text="$vuetify.theme.dark
            ? 'brightness_4'
            : 'brightness_5'"
            ></v-icon>
          </v-btn>
        </v-toolbar>
        <v-content
          app
          class="content-area"
        >
          <transition
            name="page-transition"
            enter-active-class="animation fadeIn"
          >
            <router-view />
          </transition>
          <teneo-modal></teneo-modal>
        </v-content>

      </div>
    </v-app>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      menuItems: [
        {
          icon: "chat",
          titleKey: "menu.chat",
          route: "/"
        },
        {
          icon: "help_outline",
          titleKey: "menu.help",
          route: "help"
        },
        {
          icon: "history",
          titleKey: "menu.history",
          route: "history"
        },
        {
          icon: "memory",
          titleKey: "menu.about",
          route: "about"
        },
        {
          icon: "tune",
          titleKey: "menu.config",
          route: "config"
        },
        {
          icon: "mdi-account-plus",
          titleKey: "menu.register",
          route: "register",
          when: "notAuthenticated"
        },
        {
          icon: "mdi-login-variant",
          titleKey: "menu.login",
          route: "login",
          when: "notAuthenticated"
        },
        {
          icon: "mdi-logout-variant",
          titleKey: "menu.logout",
          route: "/",
          when: "authenticated"
        }
      ],
      miniVariant: true,
      rightDrawer: false
    };
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResizeOrEmbed);
  },
  mounted() {
    // this.toggleChat(); // will automatically open the chat window on load
    if (!this.showButtonOnly) {
      window.addEventListener("resize", this.onResizeOrEmbed);
      if (window.innerWidth <= 480 || this.embed) {
        this.onResizeOrEmbed();
      }
      this.$store.dispatch("setUserInformation");
    }
  },
  computed: {
    ...mapGetters([
      "accentStyling",
      "authenticated",
      "isChatOpen",
      "dialogs",
      "chatTitle",
      "customCssButtonToolbar",
      "embed",
      "float",
      "hideConfigMenu",
      "overlayChat",
      "progressBar",
      "pulseButton",
      "showButtonOnly",
      "showChatButton",
      "showChatWindow",
      "socialAuthEnabled"
    ]),
    activeMenuItems() {
      if (this.authenticated) {
        return this.menuItems.filter(menuItem => {
          if ("when" in menuItem && menuItem.when === "authenticated") {
            return true;
          } else if (menuItem.route === "config") {
            return this.hideConfigMenu ? false : true;
          } else if (!("when" in menuItem)) {
            return true;
          } else {
            return false;
          }
        });
      } else {
        // anonymous
        return this.menuItems.filter(menuItem => {
          if (
            this.socialAuthEnabled &&
            ("when" in menuItem && menuItem.when === "notAuthenticated")
          ) {
            return true;
          } else if (menuItem.route === "config") {
            return this.hideConfigMenu ? false : true;
          } else if (!("when" in menuItem)) {
            return true;
          } else {
            return false;
          }
        });
      }
    },
    toolbarStyle() {
      let result = this.customCssButtonToolbar;
      return result + this.accentStyling;
    },
    menuClass() {
      if (!this.$vuetify.theme.dark) {
        return "grey--text text--darken-1";
      }
      return "grey--text text--lighten-2";
    },
    menuClassText() {
      if (!this.$vuetify.theme.dark) {
        return "grey--text text--darken-4 font-weight-bold";
      }
      return "grey--text text--lighten-2";
    },
    toolbarTitle() {
      if (this.$route.name === "history") {
        return this.$t("menu.history");
      } else if (this.$route.name === "help") {
        return this.$t("menu.help");
      } else if (this.$route.name === "about") {
        return this.$t("menu.about");
      } else if (this.$route.name === "register") {
        return this.$t("menu.register");
      } else if (this.$route.name === "login") {
        return this.$t("menu.login");
      } else {
        return this.chatTitle;
      }
    },
    toolbarColor() {
      return "primary white--text";
    },
    getChatState() {
      if (this.showChatWindow) {
        return "show-the-chat";
      }
      return "";
    }
  },
  methods: {
    toggleEmbedButton() {
      this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY");
      this.$store.commit("TOGGLE_CHAT_BUTTON");
      setTimeout(
        function() {
          this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // only show the open chat button once the session has ended
        }.bind(this),
        2000
      );
    },
    lookForLogout(menuItem) {
      this.drawer = false;
      document.activeElement.blur();
      if (menuItem.titleKey === "menu.logout") {
        let chatButton = document.getElementById("chat-open-close-button");
        let siteFrame;
        if (!this.embed && !this.showButtonOnly) {
          siteFrame = document.getElementById("site-frame");
        }

        this.$store.dispatch("logout");
        this.drawer = false;
        // hide chat window - button clicked - logout
        this.$store.commit("HIDE_CHAT_MODAL");
        if (!this.embed && !this.overlayChat && siteFrame) {
          siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
        }

        setTimeout(
          function() {
            this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // close the chat window - i want the iframe to resize first and then the chat window to close
            chatButton.setAttribute("class", ""); // wait a sec for button hide animation and then reposition chat button
          }.bind(this),
          1000
        );

        this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY");

        // now end the Teneo Session - user clicked the close button - intention is clear
        this.$store.dispatch("endSession").then(() => {
          this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session

          // show the loading gif as the window is closing. Although delay a bit
          setTimeout(
            function() {
              this.$store.commit("SHOW_CHAT_LOADING");
            }.bind(this),
            400
          );

          setTimeout(
            function() {
              this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // only show the open chat button once the session has ended
            }.bind(this),
            1500
          );
        });
      } //
    },
    backgroundImage() {
      return require("./assets/purple.jpg");
    },
    onResizeOrEmbed() {
      // on mobile devices open the chat window automatically
      if (
        (window.innerWidth <= 480 &&
          !this.showChatWindow &&
          !this.showButtonOnly) ||
        (this.embed && !this.showChatWindow)
      ) {
        this.$store.commit("HIDE_CHAT_BUTTON");
        this.$store.commit("SHOW_CHAT_WINDOW"); // show the chat window
        //animate the IFrame
        let siteFrame;
        if (!this.embed && !this.showButtonOnly) {
          siteFrame = document.getElementById("site-frame");
        }
        let chatButton = document.getElementById("chat-open-close-button");

        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty("--vh", `${vh}px`);

        // console.log("ok smaller than 480px");
        // open the chat automatially and hide the open and close chat button
        if (this.$router.currentRoute.path !== "/") {
          this.$router.push({ name: "chat" }); // make sure we show the main chat window
        }

        this.$store.commit("SHOW_CHAT_LOADING"); // display the loading spinner
        let isChatUiFloating = this.float;
        setTimeout(
          function() {
            // console.log(`In move button left: ${isChatUiFloating}`);
            // wait just a bit before animating things - need the chat button to hide first
            if (chatButton && !this.embed) {
              if (isChatUiFloating) {
                chatButton.setAttribute("class", "move-button-left-float"); // reposition the chat button
              } else {
                chatButton.setAttribute("class", "move-button-left"); // reposition the chat button
              }
            }

            if (!this.embed && !this.overlayChat && siteFrame) {
              siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
            }
          }.bind(this),
          400
        );
        if (this.dialogs.length === 0) {
          this.$store
            .dispatch("login")
            .then(() => {
              console.log("Successfully logged into chat");
            })
            .catch(err => {
              console.log("ERROR LOGGING IN TO CHAT: ", err.message);
            });
        } else {
          this.$store.commit("HIDE_CHAT_LOADING");
        }
      } else if (window.innerWidth > 480 && this.showChatWindow) {
        this.$store.commit("SHOW_CHAT_BUTTON");
      }
    },
    toggleBrightness() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      // this.$store.commit("CHANGE_THEME");
    },
    toggleChat() {
      if (
        !this.$store.state.chatConfig ||
        !this.$store.state.chatConfig.activeSolution
      ) {
        this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY");
        this.$router.push({ name: "config" });
        return;
      }

      this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // toggle the chat button visibility
      this.$store.commit("STOP_TTS"); // always reset audio to not speak when chat button is clicked
      let siteFrame;
      //animate the IFrame
      if (!this.embed && !this.overlayChat) {
        siteFrame = document.getElementById("site-frame");
      }

      let chatButton = document.getElementById("chat-open-close-button");

      // show chat window - button clicked - login
      if (!this.showChatWindow) {
        if (this.$router.currentRoute.path !== "/") {
          this.$router.push({ name: "chat" }); // make sure we show the main chat window
        }

        this.$store.commit("SHOW_CHAT_LOADING"); // display the loading spinner
        let isChatUiFloating = this.float;
        setTimeout(
          function() {
            // wait just a bit before animating things - need the chat button to hide first
            this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // show the chat window
            // console.log(`In move button left: ${isChatUiFloating}`);
            // wait just a bit before animating things - need the chat button to hide first
            if (chatButton) {
              if (isChatUiFloating) {
                chatButton.setAttribute("class", "move-button-left-float"); // reposition the chat button
              } else {
                chatButton.setAttribute("class", "move-button-left"); // reposition the chat button
              }
            }

            if (!this.embed && !this.overlayChat && siteFrame) {
              siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
            }
          }.bind(this),
          400
        );

        this.$store
          .dispatch("login")
          .then(() => {
            console.log("Successfully logged into chat");
            this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // only show the chat button after a successful login
          })
          .catch(err => {
            console.log("ERROR LOGGING IN TO CHAT: ", err.message);
          });
      } else {
        let chatButton = document.getElementById("chat-open-close-button");
        // hide chat window - button clicked - logout
        this.$store.commit("HIDE_CHAT_MODAL");
        if (!this.embed && !this.overlayChat && siteFrame) {
          siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
        }

        setTimeout(
          function() {
            this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // close the chat window - i want the iframe to resize first and then the chat window to close
            if (chatButton) {
              chatButton.setAttribute("class", ""); // wait a sec for button hide animation and then reposition chat button
            }
          }.bind(this),
          1000
        );

        // now end the Teneo Session - user clicked the close button - intention is clear
        this.$store.dispatch("endSession").then(() => {
          this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session

          // show the loading gif as the window is closing. Although delay a bit
          setTimeout(
            function() {
              this.$store.commit("SHOW_CHAT_LOADING");
            }.bind(this),
            400
          );

          setTimeout(
            function() {
              this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // only show the open chat button once the session has ended
            }.bind(this),
            1500
          );
        });
      }
    }
  }
};
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css";

.application-button {
  /* max-width: unset !important;
  max-height: unset !important;
  height: unset !important;
  overflow: unset !important;
  margin: unset !important;
  position: unset !important;
  top: unset !important;
  bottom: unset !important;
  right: unset !important; */
  background: transparent !important;
  width: 100%;
}

#chat-open-close-button-embed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100vh;
}

hr {
  border: 0;
  height: 3px;
  background: #d7d7d7;
  margin-bottom: 4px;
  border-top: 1px dashed #8c8b8b;
}

blockquote {
  border-left: 6px solid #d7d7d7;
  margin: 0.5em 0px;
  padding: 0.5em 10px;
  quotes: "\201C""\201D""\2018""\2019";
}
blockquote:before {
  color: #d7d7d7;
  content: open-quote;
  font-size: 4em;
  line-height: 0.1em;
  margin-right: 0.25em;
  vertical-align: -0.4em;
}
blockquote p {
  display: inline;
}

div.v-input__slot:focus,
button:focus,
a:focus {
  -webkit-box-shadow: 0 0 0 3px rgba(116, 116, 116, 0.5) !important;
  box-shadow: 0 0 0 3px rgba(116, 116, 116, 0.5) !important;
  outline: 0;
}

.pulse {
  overflow: visible;
  position: relative;
}

.pulse::before {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: inherit;
  border-radius: inherit;
  -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, -webkit-transform 0.3s;
  transition: opacity 0.3s, transform 0.3s;
  transition: opacity 0.3s, transform 0.3s, -webkit-transform 0.3s;
  -webkit-animation: pulse-animation 1s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  animation: pulse-animation 4s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  z-index: -1;
}

@-webkit-keyframes pulse-animation {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  10%,
  100% {
    opacity: 0;
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
}

@keyframes pulse-animation {
  0% {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  10%,
  100% {
    opacity: 0;
    -webkit-transform: scale(1.5);
    transform: scale(1.5);
  }
}

.light-scroll::-webkit-scrollbar {
  height: 14px;
  width: 10px;
  background: #ffffff;
}

.dark-scroll::-webkit-scrollbar {
  height: 14px;
  width: 10px;
  background: #424242;
}

.dark-scroll::-webkit-scrollbar-thumb {
  background: #262626;
}

::-webkit-scrollbar-thumb {
  background: #d8d8d8;
}

::-webkit-scrollbar-corner {
  background: black;
}

.headline {
  font-size: 1.4em !important;
}

#chat-open-close-button {
  position: fixed;
  bottom: 10vh;
  right: 3vw;
}

.move-button-left-float {
  right: calc(390px + 5%) !important;
}

.move-button-left {
  right: 390px !important;
}

#teneo {
  width: 360px;
  position: initial !important;
  word-break: break-word;
}

.teneo-toolbar-float {
  border-radius: 13px 13px 0px 0px;
  -moz-border-radius: 13px 13px 0px 0px;
  -webkit-border-radius: 13px 13px 0px 0px;
  border: 0px solid #000000;
}

.show-the-chat {
  right: 0 !important;
}

.application-float {
  max-height: 80vh !important;
  height: 80vh !important;
  right: 5% !important;
  top: 10%;
  border-radius: 13px;
  -moz-border-radius: 13px;
  -webkit-border-radius: 13px;
  position: fixed;
}

.footer-float {
  border-bottom-right-radius: 13px;
  -moz-border-bottom-right-radius: 13px;
  -webkit-border-bottom-right-radius: 13px;
  border-bottom-left-radius: 13px;
  -moz-border-bottom-left-radius: 13px;
  -webkit-border-bottom-left-radius: 13px;
  z-index: 1 !important;
}

.v-application {
  max-width: 360px;
  max-height: 100vh;
  height: 100vh !important;
  overflow: inherit;
  margin: auto;
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
}

.content-area {
  height: auto;
  padding: unset;
}

.v-navigation-drawer {
  left: auto !important;
}

iframe#site-frame {
  z-index: -100;
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.contract-iframe {
  width: calc(100vw - 360px) !important;
}

.v-expansion-panel__header {
  height: auto !important;
  padding-left: 1.5em;
  padding-right: 1.5em;
}

/* @media only screen and (max-height: 250px) {
  .application {
    display: none !important;
  }
} */

@media only screen and (max-width: 480px) {
  #teneo,
  .v-toolbar,
  .v-overlay {
    width: 100vw !important;
  }

  .v-application {
    max-width: 100vw !important;
    max-height: 100% !important;
    /* height: 100vh !important; */
    height: 100% !important;
    margin: auto;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0 !important;
    border-radius: unset;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
  }

  .application-float {
    max-height: 100vh !important;
    height: 100vh !important;
    right: 0 !important;
    top: 0;
    border-radius: unset;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
  }

  /* .teneo-footer {
    position: fixed !important;
    bottom: 10px !important;
  } */

  iframe#site-frame {
    width: 0vw !important;
    display: none !important;
  }

  #chat-open-close-button {
    display: none;
  }

  .application-embed {
    border-radius: 13px !important;
    -moz-border-radius: 13px !important;
    -webkit-border-radius: 13px !important;
  }

  .teneo-toolbar-embed {
    border-radius: 13px 13px 0 0 !important;
    -moz-border-radius: 13px 13px 0 0 !important;
    -webkit-border-radius: 13px 13px 0 0 !important;
  }

  .teneo-toolbar-float {
    border-radius: unset;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
  }
}
</style>