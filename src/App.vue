<template>

  <v-app
    toolbar
    :dark="dark"
    class="elevation-4"
  >
    <div id="chat-open-close-button">
      <v-fab-transition>
        <v-btn
          fab
          dark
          color="primary"
          @click="toggleChat"
          v-show="!hideChatButton"
        >
          <v-icon
            dark
            v-text="hideChat ? 'chat' : 'close'"
          ></v-icon>
        </v-btn>
      </v-fab-transition>
    </div>
    <div
      id="teneo"
      :class="getChatState"
      v-if="!hideChat"
    >
      <transition
        name="menu-transition"
        enter-active-class="animated slideInRight"
        leave-active-class="animated slideOutRight"
      >
        <v-navigation-drawer
          :dark="dark"
          app
          :clipped="clipped"
          v-if="drawer"
          v-model="drawer"
          enable-resize-watcher
          temporary
          right
          width="250"
        >
          <v-img
            :src='backgroundImage()'
            height="160"
          >
            <v-layout
              pa-4
              column
              fill-height
              class="lightbox white--text"
            >
              <v-spacer></v-spacer>
              <v-flex shrink>
                <div class="headline font-weight-medium">Artificial Solutions</div>
                <div class="body-2"><strong>Teneo</strong> allows your customers to speak to applications, devices and web services in a natural, humanlike and intelligent way</div>
              </v-flex>
            </v-layout>
          </v-img>
          <v-list
            :dark="dark"
            class="px-2"
          >
            <v-list-tile
              ripple
              value="true"
              v-for="(menuItem, i) in menuItems"
              :key="i"
              :to="menuItem.route"
            >
              <v-list-tile-action>
                <v-icon
                  medium
                  :dark="dark"
                  :class="menuClass"
                >{{menuItem.icon}}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title
                  class="subheading"
                  :dark="dark"
                  :class="menuClassText"
                >{{ $t(menuItem.titleKey) }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-navigation-drawer>
      </transition>
      <v-toolbar
        app
        :clipped-left="clipped"
        height="65px"
        :color="toolbarColor"
        :dark="dark"
      >
        <v-toolbar-side-icon
          @click.stop="drawer = !drawer"
          style="flex: 0 0 auto;"
          :color="toolbarColor"
        ></v-toolbar-side-icon>
        <v-toolbar-title v-text="toolbarTitle"></v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          round
          small
          dark
          fab
          @click="toggleBrightness"
          style="flex: 0 0 auto;"
          :color="dark ? 'primary': 'secondary'"
        >
          <v-icon
            dark
            v-text="
            dark
            ? 'fa-moon'
            : 'fa-sun'"
          ></v-icon>
        </v-btn>
      </v-toolbar>
      <v-content
        app
        class="
            content-area"
      >
        <transition
          name="page-transition"
          enter-active-class="animation fadeIn"
        >
          <router-view />
        </transition>
        <teneo-modal></teneo-modal>
      </v-content>
      <v-progress-linear
        :indeterminate="true"
        :active="progressBar"
        class="loading"
        height="3"
      ></v-progress-linear>

    </div>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      hideChatButton: false,
      hideChat: true,
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
        }
      ],
      miniVariant: true,
      rightDrawer: false
    };
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
    if (window.innerWidth <= 480) {
      this.onResize();
    }
  },
  computed: {
    menuClass() {
      if (!this.dark) {
        return "grey--text text--darken-1";
      }
      return "grey--text text--lighten-2";
    },
    menuClassText() {
      if (!this.dark) {
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
      } else {
        return this.$store.getters.chatTitle;
      }
    },
    toolbarColor() {
      return !this.$store.getters.dark ? "primary white--text" : "";
    },
    dark() {
      return this.$store.getters.dark;
    },
    progressBar() {
      return this.$store.getters.progressBar;
    },
    getChatState() {
      if (!this.hideChat) {
        return "show-the-chat";
      }
      return "";
    }
  },
  methods: {
    backgroundImage() {
      return require("./assets/purple.jpg");
    },
    onResize() {
      // on mobile devices open the chat window automatically
      if (window.innerWidth <= 480 && this.hideChat) {
        this.hideChatButton = true;
        this.hideChat = false; // show the chat window
        //animate the IFrame
        let siteFrame = document.getElementById("site-frame");
        let chatButton = document.getElementById("chat-open-close-button");

        console.log("ok smaller than 480px");
        // open the chat automatially and hide the open and close chat button
        this.$router.push({ name: "chat" }); // make sure we show the main chat window
        this.$store.commit("showChatLoading"); // display the loading spinner

        setTimeout(
          function() {
            // wait just a bit before animating things - need the chat button to hide first
            chatButton.setAttribute("class", "move-button-left"); // reposition the chat button
            if (!this.$store.getters.embed) {
              siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
            }
          }.bind(this),
          400
        );
        this.$store
          .dispatch("login")
          .then(() => {
            console.log("Successfully logged into chat");
          })
          .catch(err => {
            console.log("ERROR LOGGING IN TO CHAT: ", err.message);
          });
      } else if (window.innerWidth > 480 && !this.hideChat) {
        this.hideChatButton = false;
      }
    },
    toggleBrightness() {
      this.$store.commit("changeTheme");
    },
    toggleChat() {
      if (
        !this.$store.state.chatConfig ||
        !this.$store.state.chatConfig.activeSolution
      ) {
        this.hideChat = !this.hideChat;
        this.$router.push({ name: "config" });
        return;
      }
      this.hideChatButton = !this.hideChatButton; // toggle the chat button visibility
      this.$store.commit("speakBackResponses", false); // always reset audio to not speak when chat button is clicked
      let siteFrame;
      //animate the IFrame
      if (!this.$store.getters.embed) {
        siteFrame = document.getElementById("site-frame");
      }

      let chatButton = document.getElementById("chat-open-close-button");

      // show chat window - button clicked - login
      if (this.hideChat) {
        this.$router.push({ name: "chat" }); // make sure we show the main chat window
        this.$store.commit("showChatLoading"); // display the loading spinner
        setTimeout(
          function() {
            // wait just a bit before animating things - need the chat button to hide first
            this.hideChat = !this.hideChat; // show the chat window
            chatButton.setAttribute("class", "move-button-left"); // reposition the chat button
            if (!this.$store.getters.embed) {
              siteFrame.setAttribute("class", "contract-iframe"); // animate the iframe
            }
          }.bind(this),
          400
        );

        this.$store
          .dispatch("login")
          .then(() => {
            console.log("Successfully logged into chat");
            this.hideChatButton = !this.hideChatButton; // only show the chat button after a successful login
          })
          .catch(err => {
            console.log("ERROR LOGGING IN TO CHAT: ", err.message);
          });
      } else {
        // hide chat window - button clicked - logout
        this.$store.commit("hideModal");
        if (!this.$store.getters.embed) {
          siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
        }

        setTimeout(
          function() {
            this.hideChat = !this.hideChat; // close the chat window - i want the iframe to resize first and then the chat window to close
            chatButton.setAttribute("class", ""); // wait a sec for button hide animation and then reposition chat button
          }.bind(this),
          1000
        );

        // now end the Teneo Session - user clicked the close button - intention is clear
        this.$store.dispatch("endSession").then(() => {
          this.$store.commit("clearChatHistory"); // clear the dialogs once we have successfully ended the session

          // show the loading gif as the window is closing. Although delay a bit
          setTimeout(
            function() {
              this.$store.commit("showChatLoading");
            }.bind(this),
            400
          );

          setTimeout(
            function() {
              this.hideChatButton = !this.hideChatButton; // only show the open chat button once the session has ended
            }.bind(this),
            1500
          );
        });
      }
    }
  }
};
</script>

<style scoped>
.v-toolbar {
  width: 360px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  left: auto !important;
}
.v-overlay {
  width: 360px;
  left: auto !important;
  right: auto !important;
}
</style>
<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css";

html {
  overflow: hidden !important;
}

html,
body {
  overscroll-behavior-y: contain !important;
}

.headline {
  font-size: 1.4em !important;
}

#chat-open-close-button {
  position: fixed;
  bottom: 60px;
  right: 50px;
}

.move-button-left {
  right: 410px !important;
}

#teneo {
  width: 360px;
}

.show-the-chat {
  right: 0 !important;
}

.application {
  max-width: 360px;
  height: 100vh;
  position: fixed;
  right: 0;
  top: 0;
  overflow: hidden;
}

.content-area {
  overflow-y: auto !important;
  height: auto;
  position: fixed;
  top: 65px;
  padding-top: 0 !important;
}

.loading {
  position: fixed;
  bottom: 50px;
}

.v-navigation-drawer {
  left: auto !important;
}

iframe#site-frame {
  overflow: hidden;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* transition: width 0.2s ease-in-out; */
}

.contract-iframe {
  width: calc(100vw - 360px) !important;
}

.v-expansion-panel__header {
  height: auto !important;
  padding-left: 1.5em;
  padding-right: 1.5em;
}

@media only screen and (max-width: 480px) {
  #teneo,
  .v-toolbar,
  .v-overlay {
    width: 100vw !important;
  }
  .application {
    max-width: 100vw !important;
  }

  iframe#site-frame {
    width: 0vw !important;
    display: none !important;
  }

  #chat-open-close-button {
    display: none;
  }
}
</style>