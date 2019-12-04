<template>
  <div>
    <v-app :dark="$vuetify.theme.dark" v-if="showButtonOnly" class="application-button">
      <div id="chat-open-close-button-embed" @click="openEmbedButton">
        <v-fab-transition>
          <v-btn
            v-show="showChatButton"
            fab
            dark
            color="primary"
            elevation="2"
            aria-label="Open Chat"
            class="embed-button-center pulse"
            :style="customCssButtonToolbar"
          >
            <v-icon dark>mdi-message-text</v-icon>
          </v-btn>
        </v-fab-transition>
      </div>
    </v-app>
    <v-app v-else-if="['config'].indexOf($route.name) != -1">
      <router-view v-if="['config'].indexOf($route.name) != -1" />
    </v-app>
    <v-app
      v-else
      toolbar
      :class="{
        'elevation-2': !embed,
        'application-float': shouldFloat,
        'application-embed': embed,
        'application-mobile': isMobileDevice
      }"
    >
      <transition
        name="system-bar-transition"
        enter-active-class="animated fadeInRightBig"
        leave-active-class="animated fadeOutRightBig"
      >
        <v-system-bar
          window
          v-if="!maximizeChat"
          color="primary"
          class="white--text elevation-4 leopard-system-bar"
          style="border-left: 4px solid yellowgreen !important; border-right: 4px solid yellowgreen !important;"
          @click="maximizeChat = true"
        >
          <v-icon color="secondary">mdi-message-text</v-icon>
          <span>Agent Assist Bot</span>
          <v-spacer></v-spacer>
          <v-icon color="secondary">mdi-arrow-expand-all</v-icon>
        </v-system-bar>
      </transition>
      <template v-if="maximizeChat">
        <div id="chat-open-close-button" v-if="!embed">
          <v-fab-transition>
            <v-btn
              fab
              dark
              color="primary"
              :aria-label="isChatOpen ? 'Close Chat' : 'Open Chat'"
              elevation="2"
              @click="toggleChat"
              v-show="showChatButton && !isChatOpen"
              :class="{ pulse: pulseButton && !isChatOpen }"
              :style="customCssButtonToolbar"
            >
              <v-icon dark v-text="isChatOpen ? 'mdi-close' : 'mdi-message-text'"></v-icon>
            </v-btn>
          </v-fab-transition>
        </div>
        <transition
          name="chat-window-transition"
          :enter-active-class="getAnimatedIn"
          :leave-active-class="getAnimatedOut"
        >
          <div
            id="teneo"
            v-if="isChatOpen"
            :class="{
              'elevation-2': !embed,
              'application-float': float,
              'application-embed': embed,
              'teneo-light-bg': !$vuetify.theme.dark,
              'teneo-dark-bg': $vuetify.theme.dark,
              'application-mobile': isMobileDevice
            }"
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
                <v-row>
                  <v-col class="pa-0 ma-0 elevation-2">
                    <div class="primary darken-2 text-center pa-2">
                      <div class="headline white--text font-weight-medium">Artificial Solutions</div>
                    </div>
                    <div class="primary darken-1 text-center py-2 px-4">
                      <div class="white--text body-2 pa-1">{{ $t("about.page.content") }}</div>
                    </div>
                  </v-col>
                </v-row>
                <v-list class="px-2 mt-1">
                  <v-list-item ripple value="true" key="menuItemTheme" @click="toggleBrightness">
                    <v-list-item-action>
                      <v-icon
                        medium
                        :class="menuClass"
                        v-text="
                          $vuetify.theme.dark
                            ? 'mdi-brightness-5'
                            : 'mdi-brightness-4'
                        "
                      ></v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title class="subheading" :class="menuClassText">
                        {{
                        $vuetify.theme.dark ? "Light Mode" : "Dark Mode"
                        }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item
                    ripple
                    value="true"
                    v-for="(menuItem, i) in activeMenuItems"
                    :key="i + 'menuItem'"
                    :to="menuItem.route"
                  >
                    <v-list-item-action>
                      <v-icon medium :class="menuClass">
                        {{
                        menuItem.icon
                        }}
                      </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title
                        class="subheading"
                        :class="menuClassText"
                      >{{ $t(menuItem.titleKey) }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <template v-slot:append v-if="authenticated">
                  <div class="pa-2">
                    <v-btn
                      ripple
                      to="/"
                      block
                      color="primary darken-1"
                      @click="logout()"
                    >{{ $t("menu.logout") }}</v-btn>
                  </div>
                </template>
              </v-navigation-drawer>
            </transition>

            <div class="overflow-hidden" style="height: inherit; border-radius: inherit">
              <v-app-bar
                elevation="4"
                max-height="64"
                min-height="64"
                height="64"
                :color="toolbarColor"
                dark
                app
                :class="{
                  'teneo-toolbar-float': float,
                  'teneo-toolbar-embed': embed
                }"
                scroll-target="#teneo-chat-scroll"
                class="teneo-leopard-header"
                :style="toolbarStyle"
              >
                <v-fab-transition>
                  <v-btn
                    icon
                    text
                    tile
                    small
                    ripple
                    :aria-label="
                      drawer ? 'Hide the chat menu' : 'Show the chat menu'
                    "
                    @click.stop="drawer = !drawer"
                    class="embed-button-center ml-0"
                    :style="customCssButtonToolbar"
                  >
                    <v-icon dark>
                      {{
                      drawer ? "mdi-menu-open" : "mdi-menu"
                      }}
                    </v-icon>
                  </v-btn>
                </v-fab-transition>

                <v-toolbar-title v-text="toolbarTitle" class="pl-0"></v-toolbar-title>

                <v-spacer></v-spacer>
                <!-- Handle close button on production embedded sites -->
                <template v-if="embed">
                  <span @click="closeChatEmbedded">
                    <v-fab-transition>
                      <v-btn
                        icon
                        text
                        tile
                        small
                        ripple
                        aria-label="Close Chat"
                        class="embed-button-center mr-0"
                        :style="customCssButtonToolbar"
                      >
                        <v-icon dark>mdi-close</v-icon>
                      </v-btn>
                    </v-fab-transition>
                  </span>
                </template>
                <!-- Handle close button in demo mode -->
                <template v-else>
                  <v-fab-transition v-if="isLiveAgentAssist">
                    <v-btn
                      icon
                      text
                      tile
                      small
                      ripple
                      aria-label="Minimize Chat"
                      class="embed-button-center mr-1"
                      :style="customCssButtonToolbar"
                      @click="minimizeChat"
                    >
                      <v-icon dark>mdi-image-size-select-small</v-icon>
                    </v-btn>
                  </v-fab-transition>
                  <v-fab-transition>
                    <v-btn
                      icon
                      text
                      tile
                      small
                      ripple
                      aria-label="Close Chat"
                      class="embed-button-center mr-0"
                      :style="customCssButtonToolbar"
                      @click="toggleChat"
                    >
                      <v-icon dark>mdi-close</v-icon>
                    </v-btn>
                  </v-fab-transition>
                </template>
              </v-app-bar>
              <v-content app id="scrolling-techniques content-area" class="pt-0">
                <OverlayAlert />
                <transition name="page-transition" enter-active-class="animation fadeIn">
                  <router-view
                    @closeMenu="drawer = false"
                    v-if="['config'].indexOf($route.name) === -1"
                  />
                </transition>
                <teneo-modal></teneo-modal>
              </v-content>
            </div>
          </div>
        </transition>
        <v-row v-if="importDialog" justify="center">
          <v-dialog v-model="importDialog" persistent max-width="600">
            <v-card>
              <v-card-title class="headline">Solution Import</v-card-title>
              <v-card-text>
                {{ importDialogMessages.message }}
                <br />
                <br />
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">Name</th>
                        <th class="text-left">Deep Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{{ importDialogMessages.name }}</td>
                        <td>{{ importDialogMessages.deepLink }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
                <br />
                <v-alert border="top" colored-border type="warning" elevation="2">
                  Accepting will overwrite other solutions with the same name or
                  deep link.
                </v-alert>
              </v-card-text>
              <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn color="grey lighten-5" @click="importDialog = false">Cancel</v-btn>
                <v-btn color="green lighten-2" @click="importSolutionFromUrl">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </template>
    </v-app>
  </div>
</template>

<script>
const logger = require("@/utils/logging").getLogger("App.vue");
import { mapGetters } from "vuex";
import { STORAGE_KEY } from "./constants/solution-config-default.js";
import OverlayAlert from "./components/OverlayAlert";
import jsonpack from "jsonpack/main";

// import { createDetailsWidget } from "@livechat/agent-app-sdk";
// import { createMessageBoxWidget } from "@livechat/agent-app-sdk";

export default {
  components: { OverlayAlert },
  data() {
    return {
      liveChatAccessToken: null,
      liveChatAgentAssistLastMessage: null,
      importDialog: false,
      parentHeight: "",
      loginPerformed: false,
      maximizeChat: true,
      importedSolution: {},
      importDialogMessages: {},
      clipped: false,
      drawer: false,
      menuItems: [
        {
          icon: "mdi-message-text",
          titleKey: "menu.chat",
          route: "/"
        },
        {
          icon: "mdi-lifebuoy",
          titleKey: "menu.help",
          route: "help"
        },
        {
          icon: "mdi-history",
          titleKey: "menu.history",
          route: "history",
          when: this.hasDifferentHistory
        },
        {
          icon: "mdi-information-variant",
          titleKey: "menu.about",
          route: "about"
        },
        {
          icon: "mdi-message-settings-variant",
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
        }
      ],
      miniVariant: true,
      rightDrawer: false
    };
  },
  updated() {},
  created() {
    this.$store.dispatch("setupFirebase");
    this.$store.dispatch("setupLiveChatAgentAssist"); // only enabled in certain scenario
  },
  mounted() {
    logger.debug("Is embed in production? ", this.embed);
    window.addEventListener("resize", this.onResizeOrEmbed);
    // deal with import of solution
    const urlParams = new URLSearchParams(window.location.search);
    const solConfig = urlParams.get("import");
    if (solConfig) {
      this.importedSolution = jsonpack.unpack(solConfig);
      this.importDialogMessages.message = `Do you want to import this solution?`;
      this.importDialogMessages.name = this.importedSolution.name;
      this.importDialogMessages.deepLink = this.importedSolution.deepLink;
      logger.debug(`Importing the following solution config`, solConfig);
      this.importDialog = true;
    }
    // this.toggleChat(); // will automatically open the chat window on load
    if (!this.showButtonOnly) {
      if (window.innerWidth <= 480 || this.embed) {
        this.onResizeOrEmbed();
      }
      this.$store.dispatch("setUserInformation");
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResizeOrEmbed);
  },
  computed: {
    ...mapGetters([
      "isLiveAgentAssist",
      "accentStyling",
      "authenticated",
      "isPromptPollingActive",
      "getPromptPollingIntervalInMilliseconds",
      "config",
      "isMobileDevice",
      "getActivePromptInterval",
      "getLatestDialogHistory",
      "dialogs",
      "chatTitle",
      "customCssButtonToolbar",
      "getAnimatedIn",
      "getAnimatedOut",
      "embed",
      "float",
      "firebase",
      "hideConfigMenu",
      "overlayChat",
      "progressBar",
      "pulseButton",
      "showButtonOnly",
      "showChatButton",
      "isChatOpen",
      "socialAuthEnabled"
    ]),
    hasDifferentHistory() {
      if (this.getLatestDialogHistory.length !== this.dialogs.length) {
        logger.debug(`Should show 'History' menu option`);
        return true;
      } else {
        logger.debug(`Should not show 'History' menu option`);
        return false;
      }
    },
    shouldFloat() {
      logger.debug(`Show Leopard floating?`, this.float);
      if (this.float && this.$router.currentRoute.path !== "/config") {
        return true;
      } else {
        return false;
      }
    },
    activeMenuItems() {
      if (this.authenticated) {
        return this.menuItems.filter(menuItem => {
          if (
            "when" in menuItem &&
            typeof menuItem.when === "string" &&
            menuItem.when === "authenticated"
          ) {
            return true;
          } else if (
            "when" in menuItem &&
            typeof menuItem.when === "function"
          ) {
            return menuItem.when();
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
            "when" in menuItem &&
            typeof menuItem.when === "string" &&
            menuItem.when === "notAuthenticated"
          ) {
            return true;
          } else if (
            "when" in menuItem &&
            typeof menuItem.when === "function"
          ) {
            return menuItem.when();
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
    }
  },
  methods: {
    minimizeChat() {
      this.maximizeChat = false;
      setTimeout(
        function() {
          let appElement = document.getElementById("app");
          appElement.setAttribute("style", "");
        }.bind(this),
        1500
      );
    },
    isChatOpenLocalStorage() {
      let isChatOpen = localStorage.getItem("isChatOpen");
      if (isChatOpen === null) {
        isChatOpen = false;
      } else {
        isChatOpen = JSON.parse(isChatOpen);
      }

      let result = false;
      logger.debug(`isChatOpenLocalStorage: ${isChatOpen}`);
      if (isChatOpen) {
        this.$store.commit("SHOW_CHAT_WINDOW");
        this.$store.commit("HIDE_CHAT_LOADING");
        this.sendMessageToParent("showLeopard");
        logger.debug("Leopard Sent Parent Message to OPEN");
        result = true;
      } else {
        this.$store.commit("HIDE_CHAT_WINDOW");
        localStorage.setItem("isChatOpen", "false");
        this.sendMessageToParent("hideLeopard");
        logger.debug("Leopard Sent Parent Message to HIDE");
        result = false;
      }
      logger.debug(`Local Storage Thinks "isChatOpenLocalStorage": ${result}`);
      return result;
    },
    sendMessageToParent(message) {
      if (parent) {
        parent.postMessage(message, "*"); // post multiple times to each domain you want leopard on. Specifiy origin for each post.
        logger.debug("Message from Leopard >> Embed : " + message);
      }
      return true;
    },
    importSolutionFromUrl() {
      this.importDialog = false;

      let existingSolutionsWithName = this.config.solutions.findIndex(
        solution => solution.name === this.importedSolution.name
      );
      let existingSolutionsWithDeepLink = this.config.solutions.findIndex(
        solution => solution.deepLink === this.importedSolution.deepLink
      );

      if (existingSolutionsWithName < 0 && existingSolutionsWithDeepLink < 0) {
        // no clashes in name or deep link
        this.config.solutions.push(this.importedSolution); // no conflicts
      } else if (
        existingSolutionsWithName >= 0 ||
        existingSolutionsWithDeepLink >= 0
      ) {
        // name and deep link clash - replace
        this.config.solutions.splice(existingSolutionsWithDeepLink, 1);
        existingSolutionsWithName = this.config.solutions.findIndex(
          solution => solution.name === this.importedSolution.name
        );
        if (existingSolutionsWithName > 0) {
          this.config.solutions.splice(existingSolutionsWithName, 1);
        }
        ``;
        this.config.solutions.push(this.importedSolution);
      }
      this.config.activeSolution = this.importedSolution.name;
      let deepLinkUrl = `${location.protocol}//${location.host}${location.pathname}?dl=${this.importedSolution.deepLink}`;
      localStorage.setItem(STORAGE_KEY + "config", JSON.stringify(this.config));
      logger.debug(`Deep Link Url: `, deepLinkUrl);
      window.location.href = deepLinkUrl;
    },
    closeChatEmbedded() {
      this.calculateMobileHeight(); // only called on mobile devices
      logger.debug("Close Chat Embedded");
      this.$store.commit("HIDE_CHAT_BUTTON");
      this.$store.commit("HIDE_CHAT_WINDOW_DISPLAY_EMBED");
      setTimeout(
        function() {
          this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
        }.bind(this),
        2000
      );
    },
    openEmbedButton() {
      this.calculateMobileHeight(); // only called on mobile devices
      logger.debug("Open Chat Window from Embed Button");
      this.$store.commit("HIDE_CHAT_BUTTON");
      this.$store.commit("OPEN_CHAT_WINDOW_DISPLAY_EMBED");
      setTimeout(
        function() {
          this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
        }.bind(this),
        2000
      );
    },
    logout() {
      this.drawer = false;
      document.activeElement.blur();
      let chatButton = document.getElementById("chat-open-close-button");
      let siteFrame;
      if (!this.embed && !this.showButtonOnly) {
        siteFrame = document.getElementById("site-frame");
      }
      this.drawer = false;
      this.$store.commit("HIDE_CHAT_MODAL");
      this.$store.dispatch("logoutSocial");

      // hide chat window - button clicked - logout

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

      // this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // was removed
      this.loginPerformed = false;
      // now end the Teneo Session - user clicked the close button - intention is clear
      this.$store.dispatch("endSession").then(() => {
        this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session

        // show the loading gif as the window is closing. Although delay a bit
        // setTimeout(
        //   function() {
        //     this.$store.commit("SHOW_CHAT_LOADING");
        //   }.bind(this),
        //   400
        // );

        // setTimeout(
        //   function() {
        //     this.$store.commit("TOGGLE_CHAT_BUTTON_DISPLAY"); // only show the open chat button once the session has ended
        //   }.bind(this),
        //   1500
        // );
      });
    },
    calculateMobileHeight() {
      if (this.isMobileDevice) {
        // on mobile devices open the chat window automatically
        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        logger.debug("Mobile device - Calculating the View Height in JS");
        let vh = null;
        if (this.embed && parent) {
          var parentHeight = parent.getLeopardElementHeight();
          // let parentHeight = localStorage.getItem(STORAGE_KEY + "parentHeight");
          logger.debug(`Frame Height: ${parentHeight}`);
          vh = parentHeight * 0.01;
          this.parentHeight = parentHeight;
          logger.debug(`Parent Height: ${parentHeight}`);
        } else {
          vh = window.innerHeight * 0.01;
        }

        // let vh = 640 * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty("--vh", `${vh}px`);
      }
    },
    onResizeOrEmbed() {
      this.calculateMobileHeight();

      if (this.dialogs.length > 0) {
        this.loginPerformed = true;
      }

      if (
        (window.innerWidth <= 480 &&
          !this.loginPerformed &&
          !this.embed &&
          this.dialogs.length === 0) ||
        (!this.showButtonOnly &&
          this.embed &&
          this.isChatOpenLocalStorage() &&
          !this.loginPerformed &&
          this.dialogs.length === 0)
      ) {
        logger.debug(
          "Window width is narrow. Determined that we need to send login"
        );
        logger.debug(
          `onResizeOrEmbed: Has Login Been Performed? ${this.loginPerformed}`
        );
        this.loginPerformed = true;
        let that = this;
        this.$store
          .dispatch("login")
          .then(() => {
            that.loginPerformed = true;
            logger.debug("Successfully established chat session");
          })
          .catch(err => {
            logger.error("ERROR LOGGING IN TO CHAT: ", err);
          });
      } else {
        this.$store.commit("HIDE_CHAT_LOADING");
      }
      logger.debug(`AGAIN Has Login Been Performed? ${this.loginPerformed}`);
      if (this.$router.currentRoute.path === "/config") {
        return;
      }
      if (
        (window.innerWidth <= 480 && !this.embed) ||
        (this.embed && this.isChatOpenLocalStorage())
      ) {
        logger.debug(`window.innerWidth <= 480 && !this.embed`);
        this.$store.commit("HIDE_CHAT_BUTTON");
        this.$store.commit("SHOW_CHAT_WINDOW"); // show the chat window
        //animate the IFrame
        let siteFrame;
        if (!this.embed && !this.showButtonOnly) {
          siteFrame = document.getElementById("site-frame");
        }
        let chatButton = document.getElementById("chat-open-close-button");

        if (this.$router.currentRoute.path !== "/") {
          this.$router.push({ name: "chat" }); // make sure we show the main chat window
        }

        // this.$store.commit("SHOW_CHAT_LOADING"); // display the loading spinner
        let isChatUiFloating = this.float;
        setTimeout(
          function() {
            logger.debug(`In move button left: ${isChatUiFloating}`);
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
      } else if (window.innerWidth > 480 && this.isChatOpen) {
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

      this.$store.commit("HIDE_CHAT_BUTTON"); // toggle the chat button visibility
      this.$store.commit("STOP_TTS"); // always reset audio to not speak when chat button is clicked
      let siteFrame;
      //animate the IFrame
      if (!this.embed && !this.overlayChat) {
        siteFrame = document.getElementById("site-frame");
      }

      // show chat window - button clicked - login
      if (!this.isChatOpen) {
        logger.debug("Toggle Chat: Send Login");
        this.$store
          .dispatch("openChatWindow", true)
          .then(() => {
            logger.debug("Successfully logged into chat");
            setTimeout(
              function() {
                this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
              }.bind(this),
              1500
            ); // only show the chat button after a successful login
          })
          .catch(err => {
            logger.error("ERROR OPENING AND LOGGING IN TO CHAT: ", err);
          });
      } else {
        let chatButton = document.getElementById("chat-open-close-button");
        // hide chat window - button clicked - logout
        this.$store.commit("HIDE_CHAT_MODAL");
        if (!this.embed && !this.overlayChat && siteFrame) {
          siteFrame.setAttribute("class", ""); // start resizing the iframe - make it larger
        }

        // setTimeout(
        //   function() {
        this.$store.commit("TOGGLE_CHAT_WINDOW_DISPLAY"); // close the chat window - i want the iframe to resize first and then the chat window to close
        if (chatButton) {
          chatButton.setAttribute("class", ""); // wait a sec for button hide animation and then reposition chat button
        }
        //   }.bind(this),
        //   100
        // );
        this.loginPerformed = false;
        // now end the Teneo Session - user clicked the close button - intention is clear
        this.$store.dispatch("endSession").then(() => {
          this.$store.commit("CLEAR_CHAT_HISTORY"); // clear the dialogs once we have successfully ended the session
          // show the loading gif as the window is closing. Although delay a bit
          setTimeout(
            function() {
              this.$store.commit("SHOW_CHAT_LOADING");
            }.bind(this),
            100
          );

          setTimeout(
            function() {
              let appElement = document.getElementById("app");
              appElement.setAttribute("style", "");
              this.$store.commit("SHOW_CHAT_BUTTON"); // only show the open chat button once the session has ended
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

p {
  white-space: normal;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

.leopard-system-bar {
  cursor: pointer;
  border-radius: 0.5em;
  position: fixed;
  right: 50px;
  bottom: 30px;
  width: 220px;
}

.v-overlay--active {
  border-radius: 0px !important;
}

.teneo-leopard-header {
  position: relative !important;
}

#app {
  background-color: transparent;
}

#app input {
  caret-color: auto;
}

.application-button {
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

.teneo-light-bg {
  background-color: #fafafa;
}

.teneo-dark-bg {
  background-color: #313131;
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
  -webkit-box-shadow: 0 0 0 2px rgba(17, 18, 25, 0.2) !important;
  box-shadow: 0 0 0 2px rgba(17, 18, 25, 0.2) !important;
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
  background: #f5f5f5;
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
  bottom: 60px;
  right: 60px;
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
  border-radius: 13px !important;
  -moz-border-radius: 13px !important;
  -webkit-border-radius: 13px !important;
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

.v-application--wrap {
  min-height: inherit !important;
}

.content-area {
  /* height: calc(100% - 64px); */
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

@media only screen and (max-height: 480px) {
  .v-application {
    max-width: 360px !important;
    max-height: 100% !important;
    height: 100% !important;
    border-radius: unset;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
  }

  .application-float {
    max-height: 100vh !important;
    height: 100vh !important;
    top: 0;
    right: 5% !important;
    border-radius: unset;
    -moz-border-radius: unset;
    -webkit-border-radius: unset;
  }

  .application-mobile {
    min-height: calc(var(--vh, 1vh) * 100) !important;
    height: calc(var(--vh, 1vh) * 100) !important;
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

@media only screen and (max-width: 480px) {
  #teneo,
  .v-toolbar,
  .v-overlay {
    width: 100vw !important;
  }

  .v-application {
    max-width: 100vw !important;
    max-height: 100% !important;
    height: 100% !important;
    margin: auto;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0 !important;
    border-radius: unset !important;
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset !important;
  }

  .application-float {
    max-height: 100vh !important;
    height: 100vh !important;
    right: 0 !important;
    top: 0;
    border-radius: unset !important;
    -moz-border-radius: unset !important;
    -webkit-border-radius: unset !important;
  }

  .application-mobile {
    min-height: calc(var(--vh, 1vh) * 100) !important;
    height: calc(var(--vh, 1vh) * 100) !important;
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
